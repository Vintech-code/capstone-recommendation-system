<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdministratorPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'canManageAdministrators' => ['required', 'boolean'],
            'currentPassword' => ['required', 'string'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}
