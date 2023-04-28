import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { VerifyEmailResult } from './dto/verify-email-result.dto';
import { EmailService } from './email.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@charonium/common';

@Resolver()
export class EmailResolver {
  constructor(private emailService: EmailService) {}

  @Mutation(() => VerifyEmailResult)
  async verifyEmail(@Args('token') token: string): Promise<VerifyEmailResult> {
    try {
      const success = await this.emailService.verifyEmail(token);
      if (!success)
        return { success, message: ERROR_MESSAGES.CUSTOMER_SUSPENDED };
      return { success, message: SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { success: false, message: error.message };
    }
  }
}
