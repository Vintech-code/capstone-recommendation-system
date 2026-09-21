<?php

$legacyPrefix = (string) hex2bin('50415448574159535f');

return [
    'invitation_minutes' => (int) env('TCC_ADMIN_INVITATION_MINUTES', env($legacyPrefix.'ADMIN_INVITATION_MINUTES', 15)),
];
