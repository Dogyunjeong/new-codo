import { BaseEventHandler, DomainEvent, EventTypes } from '@base/shared-services';
import { ProfileManagementService } from '../api/profile/ProfileManagement.service.mts';
import { PostgresConnectionService } from '@base/shared-services';

interface UserRegisteredData {
  userId: string;
  email: string;
  displayName: string;
  provider: 'google' | 'apple';
  avatarUrl?: string;
}

export class UserRegisteredHandler extends BaseEventHandler<UserRegisteredData> {
  eventType = EventTypes.USER_REGISTERED;
  serviceName = 'profile-service';
  
  private profileService: ProfileManagementService;

  constructor() {
    super('profile-service');
    
    // Initialize profile service
    const dbConnection = PostgresConnectionService.getInstance({
      connectionString: process.env.DATABASE_URL || 'postgresql://ziririt_user:ziririt_password@localhost:5432/ziririt_db'
    });
    this.profileService = new ProfileManagementService(dbConnection.getPool());
  }

  async handle(event: DomainEvent<UserRegisteredData>): Promise<void> {
    this.logEventReceived(event);

    const { userId, email, displayName, provider, avatarUrl } = event.data;

    try {
      // Create initial profile for the new user
      await this.profileService.createProfile(userId, {
        bio: '',
        isPrivate: false
      });

      this.logger.info('Profile created for new user', {
        userId,
        email,
        displayName,
        provider,
        eventId: event.id
      });

      // You could also publish a follow-up event here
      // await eventBus.publish({
      //   type: EventTypes.USER_PROFILE_CREATED,
      //   aggregateId: userId,
      //   aggregateType: 'user',
      //   version: 1,
      //   data: { userId, profileCreated: true }
      // });

    } catch (error) {
      this.logger.error('Failed to create profile for new user', error instanceof Error ? error : new Error('Unknown error'), {
        userId,
        email,
        eventId: event.id
      });
      throw error; // Re-throw to trigger retry mechanism
    }
  }
}