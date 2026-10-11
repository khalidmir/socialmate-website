# Contact Form Email Setup Guide

## Overview
The Social Mate contact form sends emails via Google Workspace using domain-wide delegation. This setup enables:
- Contact form submissions sent from: `noreply@mail.socialmate.org`
- Notifications received at: `info@mail.socialmate.org`
- Confirmation emails sent to users from the same service account

## Architecture

### Email Flow
1. **User submits contact form** → POST to `/api/contact`
2. **Server sends to admin** → `noreply@mail.socialmate.org` → `info@mail.socialmate.org`
3. **Server sends confirmation to user** → Same sender, user's email address
4. **User replies to email** → Set reply-to `info@mail.socialmate.org` in Gmail UI

### Components
- **Cloudflare Pages Function**: `/functions/api/contact.js`
- **Contact Form**: `/contact.html`
- **Form Handler**: `/js/script.js`
- **Configuration**: `wrangler.toml`

## Prerequisites

### 1. Google Workspace Setup (Kreative Minds Account)
You're already using this for Payxem and other projects. The service account is configured at the domain level with:
- **Domain**: mail.socialmate.org (subdomain)
- **Service Account**: Created in Kreative Minds Google Cloud project
- **Delegation**: Domain-wide delegation enabled

### 2. DNS Records (Already Configured)
The following DNS records are already in place:
- **MX Record**: `mail.socialmate.org` → `smtp.google.com`
- **TXT Record**: Google Site Verification
- **SPF Record**: Updated to include Google Workspace

### 3. Email Aliases (Google Workspace Admin)
You need to set up these aliases in Google Workspace:

#### 1. Create `noreply@mail.socialmate.org` Alias
- Go to Google Workspace Admin → Users and accounts → Users
- Find the service account user (usually `socialmate@kreativeminds.ae` or similar)
- Add email aliases:
  - Add `noreply@mail.socialmate.org`
  - Add `info@mail.socialmate.org` (if not existing)

#### 2. Verify Address in Gmail
- Sign in as the service account (or impersonate via Admin)
- Verify `noreply@mail.socialmate.org` and `info@mail.socialmate.org` ownership

## Deployment Steps

### Step 1: Get Service Account Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the Kreative Minds project
3. Go to **Service Accounts**
4. Download the service account JSON key as `socialmate-key.json`

### Step 2: Set Environment Secret
In Cloudflare Pages project settings:

```bash
# Set the secret (one-liner from CLI or via dashboard)
wrangler secrets put GMAIL_SERVICE_ACCOUNT_JSON --env production < socialmate-key.json
```

Or via Cloudflare Dashboard:
1. Go to **Pages → socialmate → Settings → Environment variables**
2. Click **Add secrets**
3. Add secret `GMAIL_SERVICE_ACCOUNT_JSON`
4. Paste the entire contents of the JSON key file
5. Select **Production** environment
6. Click **Save**

### Step 3: Deploy
```bash
cd /Users/Khalidgraphy/Documents/Claude/Projects/SocialMate
git push origin main
# Cloudflare Pages auto-deploys on push
```

## Testing

### Test Contact Form Submission
1. Go to `https://socialmate.org/contact.html`
2. Fill out the form with your test email
3. Submit
4. Verify:
   - Form shows success message
   - Confirmation email received at your test email
   - Admin email received at `info@mail.socialmate.org`

### Debug Form Submissions
In Cloudflare Pages Function logs:
```bash
wrangler pages deployment list --project-name=socialmate
# Get deployment ID, then view logs
wrangler pages deployment tail <deployment-id>
```

## Email Templates

### Admin Notification Email
Recipients: `info@mail.socialmate.org`
Contains:
- Visitor name, email, phone, company
- Inquiry type
- Full message text
- Timestamp and source

### User Confirmation Email
Recipients: User's email (from form)
Contains:
- Thank you message
- Summary of their inquiry
- Reassurance of quick response (24 hours)
- Social media links
- Company info

## Troubleshooting

### Issue: Form submission fails with "Email service not configured"
**Cause**: `GMAIL_SERVICE_ACCOUNT_JSON` environment secret not set
**Fix**: Follow Step 2 of Deployment Steps above

### Issue: Email arrives but sender shows as service account email
**Cause**: Alias not properly configured in Google Workspace
**Fix**: 
1. Verify alias exists in Google Workspace Admin
2. Ensure service account has Send As permission
3. Redeploy function

### Issue: User doesn't receive confirmation email
**Cause**: 
- Gmail API quota exceeded
- Email flagged as spam
- Invalid email address in form

**Fix**:
1. Check Cloudflare Pages function logs
2. Check Gmail spam folder
3. Verify email validation in `/js/script.js`

### Issue: "Gmail send failed" error in logs
**Possible causes**:
1. Service account JWT generation failed (clock skew)
2. Domain-wide delegation not enabled for the scope
3. Mailbox quota exceeded on service account

**Fix**:
1. Sync system clock
2. Check Google Cloud project Settings → Domain-wide Delegation
3. Clean up old emails from service account mailbox

## Important Notes

### Shared Infrastructure
- The Google Workspace service account is **shared** across multiple projects (Payxem, Kreative Minds, etc.)
- Each project should use distinct sender aliases to avoid conflicts
- Contact form uses `noreply@mail.socialmate.org` specifically for this domain

### No Reply Policy
- `noreply@mail.socialmate.org` emails should not receive manual replies
- Replies to automatic emails are routed to `info@mail.socialmate.org` instead
- Users should reply to form submission confirmation using the contact page

### Email Deliverability
- SPF/DKIM/DMARC records are shared across the domain
- Ensure no wildcard DMARC policies break subdomain alignment
- Monitor delivery rates and adjust SPF if needed

### Compliance
- Ensure GDPR/PDPL compliance for data collected
- Form data is not logged to database (sent only via email)
- Consider adding data retention policy

## Maintenance

### Monthly
- Check Cloudflare Pages function logs for errors
- Monitor email delivery rates
- Verify no credentials are exposed in logs

### Quarterly
- Rotate service account keys if policy requires
- Update email templates if branding changes
- Test form submission end-to-end

## References
- [Google Gmail API Documentation](https://developers.google.com/gmail/api)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Gmail Domain-Wide Delegation](https://developers.google.com/identity/protocols/oauth2/service-account)
