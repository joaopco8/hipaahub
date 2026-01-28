/**
 * Access Control Policy Template
 * Policy ID: POL-004
 * Pages: 4-6
 */

export const ACCESS_CONTROL_POLICY_TEMPLATE = `
POLICY 4: ACCESS CONTROL POLICY

Pages: 4-6

Document Control

Field
Value
Policy ID
{{Policy_ID}}
Title
Access Control Policy
Effective Date
{{Effective_Date}}
Last Reviewed
{{Assessment_Date}}
Next Review Date
{{Next_Review_Date}}
Policy Owner
{{Security_Officer_Name}}, {{Security_Officer_Role}}
Legal Basis
45 CFR §164.312(a)
Document Classification
Confidential - Internal Use Only


1. Purpose and Legal Requirement

The purpose of this Access Control Policy is to establish procedures for {{Organization_Legal_Name}} to ensure that only authorized workforce members have access to PHI and ePHI based on their job function and the principle of minimum necessary access. This policy implements the HIPAA Security Rule requirement for access controls to prevent unauthorized access, use, or disclosure of PHI.

45 CFR §164.312(a) requires covered entities to implement policies and procedures to limit physical access to facilities and logical access to information systems that contain or process ePHI.

{{ACCESS_CONTROL_STATUS}}

{{ACCESS_PROCEDURES}}

2. Access Control Principles

2.1 Least Privilege

Each workforce member is granted the minimum level of access necessary to perform their job function. Access is not granted based on job title alone, but on specific job responsibilities.

2.2 Role-Based Access Control (RBAC)

Access is organized by role, with each role assigned a specific set of permissions. Roles are defined based on job function and clinical specialty.

2.3 Unique User Identification

Each workforce member is assigned a unique user identifier (username) that is used to authenticate access to systems and to track user activity.

2.4 Strong Authentication

All access to systems containing PHI requires strong authentication, including:

• Unique username and password

• Multi-factor authentication (MFA) for remote access and privileged accounts

• Biometric authentication for physical access to secure areas (where applicable)

3. User Account Management

3.1 Account Provisioning

New user accounts are created only upon written request from a supervisor or manager. The request must specify:

• User's name and job title

• Specific systems and data repositories requiring access

• Business justification for access

• Supervisor approval

• Estimated duration of access (if temporary)

The IT department verifies the request and creates the account with appropriate permissions.

3.2 Access Review

User access is reviewed quarterly by each supervisor to ensure that:

• Users still require access for their current job function

• Users have not been granted excessive access

• Users who have changed jobs have had their access updated

• Users who have terminated employment have had their access revoked

3.3 Account Termination

When a workforce member terminates employment or changes jobs, their access is revoked immediately. The IT department:

• Disables the user account

• Removes all access permissions

• Retrieves company devices (laptop, phone, badge)

• Securely destroys any data on company devices

• Verifies that the user cannot access any systems or data

4. Password Policy

{{#IF_PASSWORD_POLICY_ENFORCED}}
4.1 Password Requirements

All passwords must:

• Be at least {{password_min_length}} characters long

• Include uppercase letters, lowercase letters, numbers, and special characters

• Not contain the user's name or username

• Not be reused for at least 12 months

• Be changed every 90 days

• Not be the same as the previous 5 passwords

4.2 Password Management

• Passwords must never be shared with anyone, including supervisors and IT staff
• Passwords must not be written down or stored in unsecured locations
• Users should use a password manager to securely store passwords
• Temporary passwords issued by IT must be changed on first login
• Users must never use the same password for multiple systems
{{/IF_PASSWORD_POLICY_ENFORCED}}

{{#IF_NOT_PASSWORD_POLICY_ENFORCED}}
4.1 Password Requirements

{{#GAP_ACKNOWLEDGMENT:Password Policy:60 days}}

{{#REMEDIATION_COMMITMENT:Password Policy:high:60 days}}

The organization recognizes that a strong password policy is essential for protecting PHI. Upon implementation, all passwords must:

• Be at least 12 characters long
• Include uppercase letters, lowercase letters, numbers, and special characters
• Not contain the user's name or username
• Not be reused for at least 12 months
• Be changed every 90 days
• Not be the same as the previous 5 passwords

4.2 Password Management (Planned)

Upon implementation, password management requirements will include:

• Passwords must never be shared with anyone, including supervisors and IT staff
• Passwords must not be written down or stored in unsecured locations
• Users should use a password manager to securely store passwords
• Temporary passwords issued by IT must be changed on first login
• Users must never use the same password for multiple systems
{{/IF_NOT_PASSWORD_POLICY_ENFORCED}}

5. Multi-Factor Authentication (MFA)

{{#IF_MFA_ENABLED}}
5.1 MFA Requirement

Multi-factor authentication is implemented and required for:

• All remote access to systems containing PHI
• All privileged accounts (administrators, IT staff)
• All access from outside the organization's network
• All access to sensitive systems (EHR, billing, payroll)

5.2 MFA Methods

Acceptable MFA methods include:

• Time-based one-time password (TOTP) apps (Google Authenticator, Microsoft Authenticator)
• Hardware security keys (YubiKey, etc.)
• SMS or email verification codes
• Biometric authentication (fingerprint, facial recognition)
{{/IF_MFA_ENABLED}}

{{#IF_NOT_MFA_ENABLED}}
5.1 MFA Requirement

{{#GAP_ACKNOWLEDGMENT:Multi-Factor Authentication:90 days}}

{{#REMEDIATION_COMMITMENT:Multi-Factor Authentication:critical:90 days}}

The organization recognizes that multi-factor authentication is a critical security control for protecting PHI. The Risk Management Plan prioritizes MFA implementation for:

• All remote access to systems containing PHI
• All privileged accounts (administrators, IT staff)
• All access from outside the organization's network
• All access to sensitive systems (EHR, billing, payroll)

5.2 MFA Methods (Planned)

Upon implementation, acceptable MFA methods will include:

• Time-based one-time password (TOTP) apps (Google Authenticator, Microsoft Authenticator)
• Hardware security keys (YubiKey, etc.)
• SMS or email verification codes
• Biometric authentication (fingerprint, facial recognition)
{{/IF_NOT_MFA_ENABLED}}

6. Privileged Access Management

6.1 Privileged Accounts

Privileged accounts (system administrators, database administrators, IT staff) are subject to additional controls:

• Privileged accounts are used only for administrative tasks

• Privileged access is logged and monitored

• Privileged accounts are not shared

• Privileged account passwords are rotated every 30 days

• Privileged account activity is reviewed monthly

6.2 Just-In-Time Access

Privileged access is granted on a just-in-time basis for specific tasks and is automatically revoked after completion.

7. Session Management

7.1 Session Timeout

User sessions automatically time out after 15 minutes of inactivity. Users must re-authenticate to resume work.

7.2 Concurrent Sessions

Users are limited to one active session at a time. If a user attempts to log in from a second location, the first session is terminated.

8. Audit Logging

All access to systems containing PHI is logged, including:

• User identifier

• Date and time of access

• Systems or data accessed

• Actions performed (view, edit, delete)

• IP address or physical location

Audit logs are retained for a minimum of six (6) years and are reviewed regularly for unauthorized access.

9. Supporting Evidence and Related Documents

The following evidence and supporting documents are on file to demonstrate compliance with this Access Control Policy:

{{AUDIT_EVIDENCE_LIST}}

This evidence is maintained in the organization's Evidence Center and is available for audit review upon request.
`;
