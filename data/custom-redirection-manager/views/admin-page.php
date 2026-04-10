<div class="wrap">
    <h1>Redirection</h1>

    <?php
    global $wpdb;
    $table_redirects = $wpdb->prefix . 'crm_redirects';
    $table_logs = $wpdb->prefix . 'crm_logs';

    $active_tab = isset( $_GET['tab'] ) ? $_GET['tab'] : 'redirects';
    ?>

    <h2 class="nav-tab-wrapper">
        <a href="?page=custom-redirection-manager&tab=redirects" class="nav-tab <?php echo $active_tab == 'redirects' ? 'nav-tab-active' : ''; ?>">Redirects</a>
        <a href="?page=custom-redirection-manager&tab=import" class="nav-tab <?php echo $active_tab == 'import' ? 'nav-tab-active' : ''; ?>">Import</a>
        <a href="?page=custom-redirection-manager&tab=export" class="nav-tab <?php echo $active_tab == 'export' ? 'nav-tab-active' : ''; ?>">Export</a>
    </h2>

    <?php settings_errors( 'crm_messages' ); ?>

    <?php if ( $active_tab == 'redirects' ): ?>
        
        <?php
        $edit_mode = false;
        $edit_data = null;
        if ( isset( $_GET['action'] ) && $_GET['action'] == 'edit' && isset( $_GET['id'] ) ) {
            $edit_id = intval( $_GET['id'] );
            $edit_data = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_redirects WHERE id = %d", $edit_id ) );
            if ( $edit_data ) {
                $edit_mode = true;
            }
        }
        ?>

        <!-- Add/Edit Redirection Form -->
        <div class="card" style="margin-top: 20px; padding: 10px;">
            <h3><?php echo $edit_mode ? 'Edit Redirection' : 'Add new redirection'; ?></h3>
            <form method="post" action="?page=custom-redirection-manager&tab=redirects">
                <?php wp_nonce_field( 'crm_add_redirect', 'crm_nonce' ); ?>
                <input type="hidden" name="crm_action" value="<?php echo $edit_mode ? 'edit_redirect' : 'add_redirect'; ?>">
                <?php if ( $edit_mode ): ?>
                    <input type="hidden" name="redirect_id" value="<?php echo esc_attr( $edit_data->id ); ?>">
                <?php endif; ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="source_url">Source URL</label></th>
                        <td><input name="source_url" type="text" id="source_url" value="<?php echo $edit_mode ? esc_attr( $edit_data->source_url ) : ''; ?>" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="title">Title</label></th>
                        <td>
                            <input name="title" type="text" id="title" value="<?php echo $edit_mode ? esc_attr( $edit_data->title ) : ''; ?>" class="regular-text">
                            <input type="hidden" name="match_type" value="url">
                            <input type="hidden" name="position" value="<?php echo $edit_mode ? esc_attr( $edit_data->position ) : '0'; ?>">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="action_code">When matched</label></th>
                        <td>
                            <select name="action_code" id="action_code">
                                <option value="301" <?php selected( $edit_mode ? $edit_data->action_code : '', '301' ); ?>>301 - Moved Permanently</option>
                                <option value="302" <?php selected( $edit_mode ? $edit_data->action_code : '', '302' ); ?>>302 - Found</option>
                                <option value="307" <?php selected( $edit_mode ? $edit_data->action_code : '', '307' ); ?>>307 - Temporary Redirect</option>
                                <option value="308" <?php selected( $edit_mode ? $edit_data->action_code : '', '308' ); ?>>308 - Permanent Redirect</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="target_url">Target URL</label></th>
                        <td>
                            <input name="target_url" type="text" id="target_url" value="<?php echo $edit_mode ? esc_attr( $edit_data->target_url ) : ''; ?>" class="regular-text" required>
                            <input type="hidden" name="group_name" value="redirections">
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php echo $edit_mode ? 'Update Redirection' : 'Add Redirection'; ?>">
                    <?php if ( $edit_mode ): ?>
                        <a href="?page=custom-redirection-manager&tab=redirects" class="button">Cancel</a>
                    <?php endif; ?>
                </p>
            </form>
        </div>

        
        <!-- Search Form -->
        <form method="get">
            <input type="hidden" name="page" value="custom-redirection-manager">
            <input type="hidden" name="tab" value="redirects">
            <p class="search-box">
                <label class="screen-reader-text" for="crm-search-input">Search Redirects:</label>
                <input type="search" id="crm-search-input" name="s" value="<?php echo isset( $_GET['s'] ) ? esc_attr( $_GET['s'] ) : ''; ?>">
                <input type="submit" id="search-submit" class="button" value="Search Redirects">
            </p>
        </form>
        <div style="clear: both;"></div>

        <!-- List Redirects -->
        <h3>Existing Redirects</h3>
        <form method="post" action="">
            <?php wp_nonce_field( 'crm_bulk_action', 'crm_nonce' ); ?>
            <input type="hidden" name="crm_action" value="bulk_action">

            <div class="tablenav top" style="margin-bottom: 30px;">
                <div class="alignleft actions bulkactions">
                    <select name="bulk_action">
                        <option value=""><?php esc_html_e( 'Bulk actions' ); ?></option>
                        <option value="delete"><?php esc_html_e( 'Delete' ); ?></option>
                    </select>
                    <input type="submit" class="button action" value="<?php esc_attr_e( 'Apply' ); ?>">
                </div>
                <br class="clear" />
            </div>
        
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <td id="cb" class="manage-column column-cb check-column">
                            <input type="checkbox" id="crm-select-all">
                        </td>
                        <th>S.No</th>
                        <th>Title</th>
                        <th>Source URL</th>
                        <th>Target URL</th> 
                        <th>Code</th>
                        <th>Hits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $search_query = isset( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';
                    $sql = "SELECT * FROM $table_redirects";
                    
                    if ( ! empty( $search_query ) ) {
                        $sql .= $wpdb->prepare( " WHERE source_url LIKE %s OR target_url LIKE %s OR title LIKE %s", '%' . $wpdb->esc_like( $search_query ) . '%', '%' . $wpdb->esc_like( $search_query ) . '%', '%' . $wpdb->esc_like( $search_query ) . '%' );
                    }
                    
                    $sql .= " ORDER BY id DESC";
                    
                    $redirects = $wpdb->get_results( $sql );
                    if ( $redirects ) {
                        $serial_number = 1;
                        foreach ( $redirects as $redirect ) {
                            $delete_url = wp_nonce_url( admin_url( 'tools.php?page=custom-redirection-manager&action=delete&id=' . $redirect->id ), 'crm_delete_redirect' );
                            echo "<tr>";
                            echo "<th scope='row' class='check-column'><input type='checkbox' name='redirect_ids[]' value='" . intval( $redirect->id ) . "'></th>";
                            echo "<td>" . $serial_number++ . "</td>";
                            echo "<td>" . esc_html( $redirect->title ) . "</td>";
                            echo "<td>" . esc_html( $redirect->source_url ) . "</td>";
                            echo "<td>" . esc_html( $redirect->target_url ) . "</td>";
                            echo "<td>" . esc_html( $redirect->action_code ) . "</td>";
                            echo "<td>" . esc_html( $redirect->hits ) . "</td>";
                            echo "<td>";
                            echo "<a href='?page=custom-redirection-manager&action=edit&id=" . $redirect->id . "' class='button button-small' style='margin-right: 5px;'>Edit</a>";
                            echo "<a href='" . $delete_url . "' class='button button-small delete' onclick=\"return confirm('Are you sure?')\">Delete</a>";
                            echo "</td>";
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='8'>No redirects found.</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </form>

    <?php elseif ( $active_tab == '404s' ): ?>
        
        <h3>404 Error Log</h3>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>URL</th>
                    <th>Referrer</th>
                    <th>IP</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $logs = $wpdb->get_results( "SELECT * FROM $table_logs WHERE type = '404' ORDER BY created_at DESC LIMIT 100" );
                if ( $logs ) {
                    foreach ( $logs as $log ) {
                        echo "<tr>";
                        echo "<td>" . esc_html( $log->created_at ) . "</td>";
                        echo "<td>" . esc_html( $log->request_url ) . "</td>";
                        echo "<td>" . esc_html( $log->referrer ) . "</td>";
                        echo "<td>" . esc_html( $log->ip ) . "</td>";
                        echo "</tr>";
                    }
                } else {
                    echo "<tr><td colspan='4'>No 404 errors logged yet.</td></tr>";
                }
                ?>
            </tbody>
        </table>

    <?php elseif ( $active_tab == 'import' ): ?>

        <h3>Import</h3>
        <p>Import redirects from other plugins or CSV files.</p>
        
        <!-- CSV Import -->
        <div class="card" style="padding: 10px; margin-bottom: 20px;">
            <h4>Import from CSV</h4>
            <p>Import redirects from a CSV file. The CSV file should have the following columns in order: <strong>Source URL</strong>, <strong>Target URL</strong>, <strong>Title (optional)</strong>, <strong>Action Code (optional, default 301)</strong>.</p>
            <form method="post" action="" enctype="multipart/form-data">
                <?php wp_nonce_field( 'crm_import_csv', 'crm_nonce' ); ?>
                <input type="hidden" name="crm_action" value="import_csv">
                <p>
                    <input type="file" name="crm_csv_file" accept=".csv" required>
                </p>
                <p>
                    <input type="submit" name="submit" id="submit" class="button button-primary" value="Import CSV">
                </p>
            </form>
        </div>
 
    <?php elseif ( $active_tab == 'export' ): ?>

        <h3>Export</h3>
        <p>Export all redirects to a CSV file.</p>
        
        <div class="card" style="padding: 10px;">
            <h4>Export to CSV</h4>
            <p>Download a CSV file containing all your redirects.</p>
            <form method="post" action="">
                <?php wp_nonce_field( 'crm_export_csv', 'crm_nonce' ); ?>
                <input type="hidden" name="crm_action" value="export_csv">
                <p>
                    <input type="submit" name="submit" id="submit" class="button button-primary" value="Export CSV">
                </p>
            </form>
        </div>

    <?php endif; ?>
</div>
