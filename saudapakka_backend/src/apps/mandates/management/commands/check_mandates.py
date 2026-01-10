from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.mandates.models import Mandate
from apps.notifications.models import Notification
from datetime import timedelta

class Command(BaseCommand):
    help = 'Expires mandates based on 7-day acceptance and 90-day validity rules, and sends expiry warnings.'

    def handle(self, *args, **options):
        now = timezone.now()
        today = now.date()

        # 1. Handle 7-Day Acceptance Expiry
        unaccepted_count = Mandate.objects.filter(
            status='PENDING',
            acceptance_expires_at__lte=now
        ).update(status='EXPIRED')

        # 2. Handle 90-Day Validity Expiry
        expired_active_count = Mandate.objects.filter(
            status='ACTIVE',
            end_date__lte=today
        ).update(status='EXPIRED')
        
        # 3. Handle Near Expiry Notifications (e.g. 7 days before)
        expiry_threshold = today + timedelta(days=7)
        near_expiry_mandates = Mandate.objects.filter(
            status='ACTIVE',
            end_date__lte=expiry_threshold,
            is_near_expiry_notified=False
        )
        
        notification_count = 0
        for mandate in near_expiry_mandates:
            # Notify Seller
            Notification.objects.create(
                recipient=mandate.seller,
                title="Mandate Expiring Soon",
                message=f"Your mandate for {mandate.property_item.title} expires on {mandate.end_date}. Please renew if you wish to continue.",
                action_url=f"/mandates/{mandate.id}"
            )
            # Notify Broker
            if mandate.broker:
                Notification.objects.create(
                    recipient=mandate.broker,
                    title="Mandate Expiring Soon",
                    message=f"Mandate for {mandate.property_item.title} expires on {mandate.end_date}.",
                    action_url=f"/mandates/{mandate.id}"
                )
            
            mandate.is_near_expiry_notified = True
            mandate.save()
            notification_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Processed: {unaccepted_count} pending expired, {expired_active_count} active expired, {notification_count} warnings sent.'
        ))