# Database Schema

## schema_version

| version    | integer  |
|------------|----------|
| applied_on | datetime |

## family

| id       | text |
|----------|------|
| surname  | text |
| p1_name  | text |
| p1_phone | text |
| p1_email | text |
| p2_name  | text |
| p2_phone | text |
| p2_email | text |

## assignment

| id   | text |
|------|------|
| name | text |

## family_assignment

| id            | text     |
|---------------|----------|
| family_id     | text     |
| assignment_id | text     |
| date_assigned | datetime |
