# EmailJS Template Setup Guide

This document provides the templates you need to create in your EmailJS account for the NCADbook notification system.

## Setup Instructions

1. Create a free account at https://www.emailjs.com/
2. Create an Email Service (Gmail, Outlook, etc.)
3. Create the 5 templates below in your EmailJS dashboard
4. Update `src/services/email.service.js` with your Service ID, Public Key, and Template IDs
5. Test each template from the admin portal

---

## Template 1: Booking Confirmation
**Template ID:** `template_booking_confirm`

**Subject:** Your NCADbook Booking is Pending Approval - {{booking_id}}

**Body:**
```
Hi {{to_name}},

Thank you for your equipment booking request!

Booking Details:
- Booking ID: {{booking_id}}
- Equipment: {{equipment_list}}
- Pickup Date: {{start_date}}
- Return Date: {{end_date}}
- Purpose: {{purpose}}
- Status: {{status}}

Your booking is now pending approval from the equipment admin. You will receive another email once your booking has been reviewed.

Questions? Contact us at equipment@ncad.ie

Best regards,
NCADbook Equipment Team
```

---

## Template 2: Booking Approved
**Template ID:** `template_booking_approved`

**Subject:** ✅ Your NCADbook Booking is Approved - {{booking_id}}

**Body:**
```
Hi {{to_name}},

Great news! Your equipment booking has been approved.

Booking Details:
- Booking ID: {{booking_id}}
- Equipment: {{equipment_list}}
- Pickup Date: {{start_date}}
- Return Date: {{end_date}}
- Approved By: {{approved_by}}
- Approved At: {{approved_at}}

Important Reminders:
- Pick up your equipment from the Equipment Store (Building A) during office hours
- Return equipment on or before {{end_date}} to avoid late fees
- Inspect equipment before leaving and report any damage immediately
- {{return_instructions}}

Pickup Hours:
Monday - Friday: 9:00 AM - 5:00 PM

Questions? Contact us at equipment@ncad.ie

Enjoy your booking!
NCADbook Equipment Team
```

---

## Template 3: Booking Denied
**Template ID:** `template_booking_denied`

**Subject:** ⚠️ Your NCADbook Booking Request - {{booking_id}}

**Body:**
```
Hi {{to_name}},

Unfortunately, your equipment booking request could not be approved at this time.

Booking Details:
- Booking ID: {{booking_id}}
- Equipment: {{equipment_list}}
- Requested Dates: {{start_date}} - {{end_date}}
- Reviewed By: {{denied_by}}
- Reviewed At: {{denied_at}}

Reason:
{{denial_reason}}

What to do next:
- Check equipment availability for different dates
- Contact the equipment team if you have questions about this decision
- Submit a new booking request if needed

Need help? Contact us at {{support_email}}

Best regards,
NCADbook Equipment Team
```

---

## Template 4: Overdue Reminder
**Template ID:** `template_booking_overdue`

**Subject:** ⚠️ URGENT: Equipment Return Overdue - {{booking_id}}

**Body:**
```
Hi {{to_name}},

This is an urgent reminder that your equipment booking is now overdue.

Overdue Booking:
- Booking ID: {{booking_id}}
- Equipment: {{equipment_list}}
- Return Date: {{end_date}}
- Days Overdue: {{days_overdue}}

{{late_fee_warning}}

PLEASE RETURN IMMEDIATELY:
- Location: {{return_location}}
- Email: {{support_email}}

Overdue equipment affects other students who have reservations. Please return the equipment as soon as possible to avoid further consequences.

If you have already returned the equipment, please disregard this message and contact us to update your booking status.

Thank you for your immediate attention,
NCADbook Equipment Team
```

---

## Template 5: Booking Reminder (Before Pickup)
**Template ID:** `template_booking_reminder`

**Subject:** 📅 Reminder: Your Equipment Pickup in {{days_until_pickup}} Days - {{booking_id}}

**Body:**
```
Hi {{to_name}},

This is a friendly reminder about your upcoming equipment booking!

Booking Details:
- Booking ID: {{booking_id}}
- Equipment: {{equipment_list}}
- Pickup Date: {{start_date}}
- Return Date: {{end_date}}
- Days Until Pickup: {{days_until_pickup}}

Pickup Information:
- Location: {{pickup_location}}
- Hours: {{pickup_hours}}

Before You Arrive:
✓ Bring your student ID
✓ Arrive during pickup hours
✓ Inspect equipment before leaving
✓ Note the return date: {{end_date}}

If you need to cancel or modify your booking, please do so through your NCADbook portal as soon as possible.

Questions? Contact us at equipment@ncad.ie

Looking forward to seeing you!
NCADbook Equipment Team
```

---

## Template Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Student email address | student@ncad.ie |
| `{{to_name}}` | Student full name | John Smith |
| `{{booking_id}}` | Unique booking ID | BK1234567890 |
| `{{equipment_list}}` | Comma-separated list | Canon EOS R5, 24-70mm Lens |
| `{{start_date}}` | Pickup date | 1/15/2024 |
| `{{end_date}}` | Return date | 1/20/2024 |
| `{{purpose}}` | Booking purpose | Final Year Project |
| `{{status}}` | Booking status | pending |
| `{{approved_by}}` | Admin name | Sarah Admin |
| `{{approved_at}}` | Timestamp | 1/10/2024, 2:30 PM |
| `{{denied_by}}` | Admin name | Sarah Admin |
| `{{denied_at}}` | Timestamp | 1/10/2024, 2:30 PM |
| `{{denial_reason}}` | Admin reason | Equipment already booked |
| `{{days_overdue}}` | Number of days | 3 |
| `{{days_until_pickup}}` | Number of days | 2 |
| `{{late_fee_warning}}` | Warning text | Late fees may apply. |
| `{{return_location}}` | Pickup location | Equipment Store, Building A |
| `{{return_instructions}}` | Instructions | Please return equipment on time |
| `{{support_email}}` | Support email | equipment@ncad.ie |
| `{{pickup_location}}` | Pickup location | Equipment Store, Building A |
| `{{pickup_hours}}` | Business hours | Mon-Fri: 9am-5pm |

---

## Testing Your Templates

After creating the templates in EmailJS:

1. Log in as Master Admin at http://localhost:5173
2. Navigate to **Admin > Features**
3. Scroll to **Email Notifications Configuration**
4. Enter your EmailJS credentials:
   - Service ID (from EmailJS dashboard)
   - Public Key (from EmailJS dashboard)
   - Template IDs (the IDs you created above)
5. Click **Save Configuration**
6. Use the **Test Email** buttons to send test emails to yourself
7. Verify all variables are rendering correctly

---

## Troubleshooting

**Emails not sending?**
- Verify Service ID and Public Key are correct
- Check EmailJS dashboard for quota limits (free tier: 200 emails/month)
- Ensure template IDs match exactly
- Check browser console for error messages

**Variables not rendering?**
- Double-check variable names match exactly (case-sensitive)
- Ensure template uses double curly braces: `{{variable_name}}`
- Test with sample data from EmailJS template editor

**Emails going to spam?**
- Use a verified email service (Gmail, Outlook)
- Add "equipment@ncad.ie" to safe senders
- Test with different email providers
- Consider upgrading EmailJS plan for better deliverability

---

## Production Recommendations

1. **Upgrade EmailJS Plan**: Free tier (200 emails/month) may not be sufficient for 1,600 students
2. **Use Custom Domain**: Configure EmailJS to send from @ncad.ie domain
3. **Monitor Quota**: Set up alerts when approaching email limits
4. **Test Thoroughly**: Send test emails to all staff before production launch
5. **Backup Plan**: Have manual notification process ready if EmailJS fails
6. **GDPR Compliance**: Review EmailJS privacy policy and data handling
7. **Rate Limiting**: Implement delays between bulk email sends to avoid quota issues

---

## Next Steps

1. Create EmailJS account and templates
2. Update `src/services/email.service.js` with credentials
3. Test all 5 notification types
4. Train staff on email configuration UI
5. Monitor email deliverability during initial rollout
