#!/usr/bin/env python3
"""
VetSorcery Response Handler - Process inbound email responses
"""

import imaplib
import email
import json
from datetime import datetime

class VetSorceryResponseHandler:
    def __init__(self):
        self.imap_server = 'imap.gmail.com'
        self.email_address = 'outreach@vetsorcery.com'
        self.email_password = 'your-app-password'
        
    def check_responses(self):
        """Check for new email responses"""
        mail = imaplib.IMAP4_SSL(self.imap_server)
        mail.login(self.email_address, self.email_password)
        mail.select('inbox')
        
        # Search for unread emails
        status, messages = mail.search(None, 'UNSEEN')
        
        responses = []
        for msg_id in messages[0].split():
            status, msg_data = mail.fetch(msg_id, '(RFC822)')
            email_body = email.message_from_bytes(msg_data[0][1])
            
            response = {
                'from': email_body['From'],
                'subject': email_body['Subject'],
                'date': email_body['Date'],
                'body': self.get_email_body(email_body),
                'sentiment': self.analyze_sentiment(email_body),
                'priority': self.determine_priority(email_body)
            }
            responses.append(response)
            
        mail.close()
        mail.logout()
        return responses
        
    def analyze_sentiment(self, email_body):
        """Analyze response sentiment"""
        # Simple keyword analysis
        body_text = str(email_body).lower()
        
        if any(word in body_text for word in ['interested', 'demo', 'schedule', 'yes']):
            return 'positive'
        elif any(word in body_text for word in ['not interested', 'no', 'remove', 'unsubscribe']):
            return 'negative'
        else:
            return 'neutral'
            
    def determine_priority(self, email_body):
        """Determine response priority"""
        body_text = str(email_body).lower()
        
        if any(word in body_text for word in ['urgent', 'asap', 'emergency', 'immediate']):
            return 'high'
        elif any(word in body_text for word in ['demo', 'call', 'meeting', 'interested']):
            return 'medium'
        else:
            return 'low'

if __name__ == '__main__':
    handler = VetSorceryResponseHandler()
    responses = handler.check_responses()
    
    for response in responses:
        print(f"New response from {response['from']}: {response['sentiment']} sentiment, {response['priority']} priority")
