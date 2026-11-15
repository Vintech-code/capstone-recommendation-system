<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>Verify your email address</title>
    <style>
        @media only screen and (max-width: 620px) {
            .email-shell { padding: 20px 12px !important; }
            .email-card { border-radius: 20px !important; }
            .email-content { padding: 28px 22px !important; }
            .email-header { padding: 22px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background:#F7FAF2; color:#34402D; font-family:Arial, Helvetica, sans-serif;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    Confirm your email to finish setting up your Student Applicant account.
</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:#F7FAF2;">
    <tr>
        <td class="email-shell" align="center" style="padding:40px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="width:100%; max-width:600px; overflow:hidden; background:#FBFFF7; border:1px solid #DCE7D4; border-radius:24px; box-shadow:0 1px 2px rgba(52,64,45,0.12);">
                <tr>
                    <td class="email-header" style="padding:26px 32px; background:#EEF5E8; border-bottom:1px solid #DCE7D4;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                                <td style="vertical-align:middle;">
                                    <span style="display:inline-block; padding:7px 11px; background:#7ED321; color:#20340F; border-radius:999px; font-size:13px; line-height:16px; font-weight:700; letter-spacing:0.08em;">TCC</span>
                                    <span style="display:inline-block; margin-left:10px; color:#34402D; font-size:15px; line-height:22px; font-weight:700; vertical-align:middle;">Course Recommendation</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="email-content" style="padding:38px 40px 34px;">
                        <p style="margin:0 0 10px; color:#3B700B; font-size:13px; line-height:20px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Account verification</p>
                        <h1 style="margin:0 0 22px; color:#34402D; font-size:30px; line-height:38px; font-weight:700;">Verify your email address</h1>
                        <p style="margin:0 0 14px; color:#34402D; font-size:16px; line-height:26px;">Hi {{ $firstName }},</p>
                        <p style="margin:0 0 26px; color:#65705F; font-size:16px; line-height:26px;">
                            Thanks for creating a Student Applicant account. Confirm that <strong style="color:#34402D;">{{ $email }}</strong> belongs to you before signing in.
                        </p>

                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
                            <tr>
                                <td align="center" bgcolor="#7ED321" style="border-radius:12px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 2px rgba(52,64,45,0.12);">
                                    <a href="{{ $verificationUrl }}" style="display:inline-block; min-width:190px; padding:14px 22px; color:#20340F; font-size:15px; line-height:20px; font-weight:700; text-align:center; text-decoration:none; border-radius:12px;">Verify email address</a>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:0 0 28px; background:#EFF9DF; border-radius:16px;">
                            <tr>
                                <td style="padding:18px 20px; color:#3B700B; font-size:14px; line-height:22px;">
                                    <strong>Security note:</strong> This link expires in {{ $expiresInMinutes }} minutes. If you did not create this account, you can safely ignore this email.
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 8px; color:#65705F; font-size:13px; line-height:21px;">If the button does not work, copy and paste this link into your browser:</p>
                        <p style="margin:0; word-break:break-all; color:#3B700B; font-size:12px; line-height:20px;">
                            <a href="{{ $verificationUrl }}" style="color:#3B700B; text-decoration:underline;">{{ $verificationUrl }}</a>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:22px 32px; background:#EEF5E8; border-top:1px solid #DCE7D4; color:#65705F; font-size:12px; line-height:19px; text-align:center;">
                        TCC Course Recommendation &bull; Student Applicant portal<br>
                        This is an automated account-security email.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
