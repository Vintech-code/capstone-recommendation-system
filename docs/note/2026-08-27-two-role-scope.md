# Two-role scope decision

**Status:** APPROVED by the repository owner on 2026-08-27.

The application now has exactly two roles: **Student Applicant** and **Administrator**. The former third-role staff portal, its account lifecycle, case/request workflow, private notes, summaries, follow-up records, APIs, navigation, fixtures, and active schema are removed.

The Student Applicant portal remains part of the system. The Administrator portal remains responsible for programme governance, Student and assessment monitoring, aggregate reports, and audit activity.

The removal migration deletes legacy workflow records and suspends accounts that held only the removed role before deleting that role. A verified database backup is required before applying it to any environment containing valuable data.
