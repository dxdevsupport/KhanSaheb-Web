<?php
/**
 * Plugin Name: Custom Redirection Manager
 * Description: A simple redirection manager for WordPress. Manage 301 redirections, keep track of 404 errors, and import from Simple 301 Redirects.
 * Version: 1.0.0
 * Author: Element8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CRM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CRM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

class Custom_Redirection_Manager {

    private $table_redirects;
    private $table_logs;

    public function __construct() {
        global $wpdb;
        $this->table_redirects = $wpdb->prefix . 'crm_redirects';
        $this->table_logs = $wpdb->prefix . 'crm_logs';

        register_activation_hook( __FILE__, array( $this, 'activate' ) );

        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'handle_export' ) );
        add_action( 'template_redirect', array( $this, 'handle_redirects' ), 1 );
        add_action( '404_template', array( $this, 'log_404' ) );
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
    }

    public function register_rest_routes() {
        register_rest_route( 'crm/v1', '/redirects', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_redirects_api' ),
            'permission_callback' => '__return_true',
        ) );

        register_rest_route( 'crm/v1', '/redirects/(?P<id>\d+)', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_redirect_api' ),
            'permission_callback' => array( $this, 'check_api_permission' ),
        ) );

        register_rest_route( 'crm/v1', '/redirects', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'create_redirect_api' ),
            'permission_callback' => array( $this, 'check_api_permission' ),
        ) );

        register_rest_route( 'crm/v1', '/redirects/(?P<id>\d+)', array(
            'methods'  => 'DELETE',
            'callback' => array( $this, 'delete_redirect_api' ),
            'permission_callback' => array( $this, 'check_api_permission' ),
        ) );

        register_rest_route( 'crm/v1', '/hit/(?P<id>\d+)', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'record_hit_api' ),
            'permission_callback' => '__return_true',
        ) );

        register_rest_route( 'crm/v1', '/logs', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_logs_api' ),
            'permission_callback' => array( $this, 'check_api_permission' ),
        ) );
    }

    public function check_api_permission() {
        return current_user_can( 'manage_options' );
    }

    public function get_redirects_api( $request ) {
        global $wpdb;
        $redirects = $wpdb->get_results( "SELECT * FROM $this->table_redirects ORDER BY id DESC" );
        return rest_ensure_response( $redirects );
    }

    public function get_redirect_api( $request ) {
        global $wpdb;
        $id = $request['id'];
        $redirect = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $this->table_redirects WHERE id = %d", $id ) );
        
        if ( ! $redirect ) {
            return new WP_Error( 'no_redirect', 'Redirect not found', array( 'status' => 404 ) );
        }

        return rest_ensure_response( $redirect );
    }

    public function create_redirect_api( $request ) {
        $params = $request->get_params();
        
        if ( empty( $params['source_url'] ) || empty( $params['target_url'] ) ) {
            return new WP_Error( 'missing_params', 'Source URL and Target URL are required', array( 'status' => 400 ) );
        }

        $data = array(
            'source_url' => $params['source_url'],
            'title' => isset( $params['title'] ) ? $params['title'] : '',
            'match_type' => isset( $params['match_type'] ) ? $params['match_type'] : 'url',
            'action_code' => isset( $params['action_code'] ) ? intval( $params['action_code'] ) : 301,
            'target_url' => $params['target_url'],
            'group_name' => isset( $params['group_name'] ) ? $params['group_name'] : 'redirections',
            'position' => isset( $params['position'] ) ? intval( $params['position'] ) : 0,
        );

        $this->add_redirect( $data );
        
        global $wpdb;
        $new_id = $wpdb->insert_id;
        $redirect = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $this->table_redirects WHERE id = %d", $new_id ) );

        return rest_ensure_response( $redirect );
    }

    public function delete_redirect_api( $request ) {
        $id = $request['id'];
        $this->delete_redirect( $id );
        return rest_ensure_response( array( 'message' => 'Redirect deleted', 'id' => $id ) );
    }

    public function record_hit_api( $request ) {
        $id = $request['id'];
        $params = $request->get_json_params();
        
        global $wpdb;
        $redirect = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $this->table_redirects WHERE id = %d", $id ) );
        
        if ( ! $redirect ) {
            return new WP_Error( 'no_redirect', 'Redirect not found', array( 'status' => 404 ) );
        }

        $url = isset( $params['url'] ) ? $params['url'] : '';
        $ip = isset( $params['ip'] ) ? $params['ip'] : '';
        $referrer = isset( $params['referrer'] ) ? $params['referrer'] : '';

        $this->log_hit( $redirect, $url, $ip, $referrer );
        
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function get_logs_api( $request ) {
        global $wpdb;
        $limit = isset( $request['limit'] ) ? intval( $request['limit'] ) : 100;
        $logs = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $this->table_logs WHERE type = '404' ORDER BY created_at DESC LIMIT %d", $limit ) );
        return rest_ensure_response( $logs );
    }

    public function activate() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql_redirects = "CREATE TABLE $this->table_redirects (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            source_url text NOT NULL,
            match_type varchar(20) DEFAULT 'url' NOT NULL,
            action_code int(3) DEFAULT 301 NOT NULL,
            target_url text NOT NULL,
            title varchar(255) DEFAULT '' NOT NULL,
            group_name varchar(50) DEFAULT 'redirections' NOT NULL,
            position int(5) DEFAULT 0 NOT NULL,
            hits mediumint(9) DEFAULT 0 NOT NULL,
            status varchar(10) DEFAULT 'enabled' NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        $sql_logs = "CREATE TABLE $this->table_logs (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            redirect_id mediumint(9) DEFAULT 0,
            request_url text NOT NULL,
            referrer text DEFAULT '',
            ip varchar(50) DEFAULT '',
            created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
            type varchar(20) DEFAULT 'redirect' NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql_redirects );
        dbDelta( $sql_logs );
    }

    public function add_admin_menu() {
        add_menu_page(
            'Redirection Manager',
            'Redirections',
            'manage_options',
            'custom-redirection-manager',
            array( $this, 'admin_page' ),
            'dashicons-redo',
            80
        );
    }

    public function admin_page() {
        // Handle form submissions
        $this->handle_admin_actions();
        
        // Display the admin UI
        include_once( CRM_PLUGIN_DIR . 'views/admin-page.php' );
    }

    public function handle_export() {
        if ( isset( $_POST['crm_action'] ) && $_POST['crm_action'] == 'export_csv' && check_admin_referer( 'crm_export_csv', 'crm_nonce' ) ) {
            global $wpdb;
            $redirects = $wpdb->get_results( "SELECT * FROM $this->table_redirects ORDER BY id DESC", ARRAY_A );
            
            if ( empty( $redirects ) ) {
                add_settings_error( 'crm_messages', 'crm_message', 'No redirects to export.', 'error' );
                return;
            }

            $project = sanitize_title( get_bloginfo( 'name' ) );
            if ( $project === '' ) {
                $project = 'site';
            }
            $filename = 'crm-redirects-' . $project . '-' . date( 'Y-m-d-H-i-s' ) . '.csv';
            
            header( 'Content-Type: text/csv; charset=utf-8' );
            header( 'Content-Disposition: attachment; filename=' . $filename );
            
            $output = fopen( 'php://output', 'w' );
            
            // Header row
            fputcsv( $output, array( 'Source URL', 'Target URL', 'Title', 'Action Code', 'Hits' ) );
            
            foreach ( $redirects as $redirect ) {
                fputcsv( $output, array(
                    $redirect['source_url'],
                    $redirect['target_url'],
                    $redirect['title'],
                    $redirect['action_code'],
                    $redirect['hits']
                ) );
            }
            
            fclose( $output );
            exit;
        }
    }

    private function handle_admin_actions() {
        if (
            isset( $_POST['crm_action'] )
            && in_array( $_POST['crm_action'], array( 'add_redirect', 'edit_redirect' ), true )
            && check_admin_referer( 'crm_add_redirect', 'crm_nonce' )
        ) {
            if ( $_POST['crm_action'] == 'add_redirect' ) {
                $this->add_redirect( $_POST );
            } elseif ( $_POST['crm_action'] == 'edit_redirect' ) {
                $this->update_redirect( intval( $_POST['redirect_id'] ), $_POST );
            }
        }

        if ( isset( $_POST['crm_action'] ) && $_POST['crm_action'] == 'import_simple_301' && check_admin_referer( 'crm_import_simple_301', 'crm_nonce' ) ) {
            $this->import_simple_301_redirects();
        }

        if ( isset( $_POST['crm_action'] ) && $_POST['crm_action'] == 'import_csv' && check_admin_referer( 'crm_import_csv', 'crm_nonce' ) ) {
            $this->import_csv_redirects();
        }

        if (
            isset( $_POST['crm_action'] )
            && $_POST['crm_action'] === 'bulk_action'
            && check_admin_referer( 'crm_bulk_action', 'crm_nonce' )
        ) {
            $bulk_action = isset( $_POST['bulk_action'] ) ? $_POST['bulk_action'] : '';
            $ids = isset( $_POST['redirect_ids'] ) && is_array( $_POST['redirect_ids'] ) ? array_map( 'intval', $_POST['redirect_ids'] ) : array();

            if ( $bulk_action === 'delete' && ! empty( $ids ) ) {
                foreach ( $ids as $id ) {
                    $this->delete_redirect( $id );
                }
            }
        }
        
        if ( isset( $_GET['action'] ) && $_GET['action'] == 'delete' && isset( $_GET['id'] ) && check_admin_referer( 'crm_delete_redirect' ) ) {
            $this->delete_redirect( intval( $_GET['id'] ) );
        }
    }

    private function import_simple_301_redirects() {
        $redirects = get_option( '301_redirects' );
        if ( ! empty( $redirects ) && is_array( $redirects ) ) {
            foreach ( $redirects as $source => $target ) {
                $this->add_redirect( array(
                    'source_url' => $source,
                    'title' => 'Imported from Simple 301 Redirects',
                    'match_type' => 'url',
                    'action_code' => 301,
                    'target_url' => $target,
                    'group_name' => 'redirections',
                    'position' => 0
                ) );
            }
            add_settings_error( 'crm_messages', 'crm_message', 'Redirects imported successfully.', 'updated' );
        } else {
            add_settings_error( 'crm_messages', 'crm_message', 'No redirects found to import from Simple 301 Redirects.', 'error' );
        }
    }

    private function import_csv_redirects() {
        if ( ! isset( $_FILES['crm_csv_file'] ) || empty( $_FILES['crm_csv_file']['tmp_name'] ) ) {
            add_settings_error( 'crm_messages', 'crm_message', 'Please upload a CSV file.', 'error' );
            return;
        }

        $file = $_FILES['crm_csv_file']['tmp_name'];
        $handle = fopen( $file, 'r' );
        
        if ( $handle === false ) {
            add_settings_error( 'crm_messages', 'crm_message', 'Could not open the CSV file.', 'error' );
            return;
        }

        $imported_count = 0;
        $row = 0;
        while ( ( $data = fgetcsv( $handle, 1000, "," ) ) !== false ) {
            $row++;
            // Skip header if it looks like a header
            if ( $row == 1 && ( strtolower( $data[0] ) == 'source_url' || strtolower( $data[0] ) == 'source url' || strtolower( $data[0] ) == 'from' ) ) {
                continue;
            }

            $source_url = isset( $data[0] ) ? trim( $data[0] ) : '';
            $target_url = isset( $data[1] ) ? trim( $data[1] ) : '';
            $title = isset( $data[2] ) ? trim( $data[2] ) : '';
            $action_code = isset( $data[3] ) && is_numeric( $data[3] ) ? intval( $data[3] ) : 301;

            if ( empty( $source_url ) || empty( $target_url ) ) {
                continue;
            }

            if ( $title === '' ) {
                $path = parse_url( $source_url, PHP_URL_PATH );
                $path = trim( $path, '/' );
                if ( $path !== '' ) {
                    $segments = explode( '/', $path );
                    $last_segment = end( $segments );
                    $last_segment = urldecode( $last_segment );
                    $last_segment = preg_replace( '/[-_]+/', ' ', $last_segment );
                    $title = ucwords( $last_segment );
                }
            }

            $this->add_redirect( array(
                'source_url' => $source_url,
                'title' => $title,
                'match_type' => 'url',
                'action_code' => $action_code,
                'target_url' => $target_url,
                'group_name' => 'redirections',
                'position' => 0
            ) );
            $imported_count++;
        }
        fclose( $handle );

        add_settings_error( 'crm_messages', 'crm_message', "Imported $imported_count redirects from CSV.", 'updated' );
    }

    private function add_redirect( $data ) {
        global $wpdb;
        $wpdb->insert(
            $this->table_redirects,
            array(
                'source_url' => sanitize_text_field( $data['source_url'] ),
                'title' => sanitize_text_field( $data['title'] ),
                'match_type' => sanitize_text_field( $data['match_type'] ),
                'action_code' => intval( $data['action_code'] ),
                'target_url' => esc_url_raw( $data['target_url'] ),
                'group_name' => sanitize_text_field( $data['group_name'] ),
                'position' => intval( $data['position'] ),
                'status' => 'enabled'
            )
        );
    }

    private function update_redirect( $id, $data ) {
        global $wpdb;
        $wpdb->update(
            $this->table_redirects,
            array(
                'source_url' => sanitize_text_field( $data['source_url'] ),
                'title' => sanitize_text_field( $data['title'] ),
                'match_type' => sanitize_text_field( $data['match_type'] ),
                'action_code' => intval( $data['action_code'] ),
                'target_url' => esc_url_raw( $data['target_url'] ),
                'group_name' => sanitize_text_field( $data['group_name'] ),
                'position' => intval( $data['position'] ),
            ),
            array( 'id' => $id )
        );
        // Clear query args to exit edit mode
        $_GET['action'] = ''; 
        $_GET['id'] = '';
    }

    private function delete_redirect( $id ) {
        global $wpdb;
        $wpdb->delete( $this->table_redirects, array( 'id' => $id ) );
    }

    public function handle_redirects() {
        if ( is_admin() ) return;

        global $wpdb;
        $request_url = $_SERVER['REQUEST_URI'];
        
        // Simple exact match first
        $redirects = $wpdb->get_results( "SELECT * FROM $this->table_redirects WHERE status = 'enabled'" );
        
        foreach ( $redirects as $redirect ) {
            $matched = false;
            
            if ( $redirect->match_type == 'url' ) {
                // Determine if we need to match exact or ignore query params
                // For now, let's just do simple string comparison
                // Ideally, we normalize URLs
                if ( rtrim( $request_url, '/' ) == rtrim( $redirect->source_url, '/' ) ) {
                    $matched = true;
                }
            }
            // Add regex support later if needed

            if ( $matched ) {
                // Log the hit
                $this->log_hit( $redirect, $request_url );
                
                // Perform redirect
                wp_redirect( $redirect->target_url, $redirect->action_code );
                exit;
            }
        }
    }

    private function log_hit( $redirect, $request_url, $ip = null, $referrer = null ) {
        global $wpdb;
        
        if ( ! $ip ) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        if ( ! $referrer ) {
            $referrer = isset( $_SERVER['HTTP_REFERER'] ) ? $_SERVER['HTTP_REFERER'] : '';
        }

        // Update hit count
        $wpdb->query( $wpdb->prepare( "UPDATE $this->table_redirects SET hits = hits + 1 WHERE id = %d", $redirect->id ) );
        
        // Log entry
        $wpdb->insert(
            $this->table_logs,
            array(
                'redirect_id' => $redirect->id,
                'request_url' => $request_url,
                'referrer' => $referrer,
                'ip' => $ip,
                'created_at' => current_time( 'mysql' ),
                'type' => 'redirect'
            )
        );
    }

    public function log_404( $template ) {
        global $wpdb;
        // Check if it's really a 404
        if ( ! is_404() ) return $template;

        $request_url = $_SERVER['REQUEST_URI'];
        
        // Avoid logging static files (images, css, js) to reduce noise
        if ( preg_match( '/\.(jpg|jpeg|png|gif|ico|css|js)$/i', $request_url ) ) {
            return $template;
        }

        $wpdb->insert(
            $this->table_logs,
            array(
                'redirect_id' => 0,
                'request_url' => $request_url,
                'referrer' => isset( $_SERVER['HTTP_REFERER'] ) ? $_SERVER['HTTP_REFERER'] : '',
                'ip' => $_SERVER['REMOTE_ADDR'],
                'created_at' => current_time( 'mysql' ),
                'type' => '404'
            )
        );
        
        return $template;
    }
}

new Custom_Redirection_Manager();
