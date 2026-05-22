<?php
function flashMessage($name, $message = '', $class = 'info') {
    if (!empty($message)) {
        $_SESSION[$name] = "<div class='alert alert-$class'>$message</div>";
    } elseif (isset($_SESSION[$name])) {
        echo $_SESSION[$name];
        unset($_SESSION[$name]);
    }
}
