<?php

namespace App\Models;

enum RoleSlug: string
{
    case Student = 'student';
    case Admin = 'admin';
    case SystemAdmin = 'system-admin';
}
