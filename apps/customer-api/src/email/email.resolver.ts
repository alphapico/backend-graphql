import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { VerifyEmailResult } from './dto/verify-email-result.dto';
import { EmailService } from './email.service';
import { DESCRIPTION, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@styx/common';

@Resolver()
export class EmailResolver {
  constructor(private emailService: EmailService) {}

  @Mutation(() => VerifyEmailResult, {
    description: DESCRIPTION.VERIFY_EMAIL,
  })
  async verifyEmail(@Args('token') token: string): Promise<VerifyEmailResult> {
    try {
      const success = await this.emailService.verifyEmail(token);
      if (!success)
        return { success, message: ERROR_MESSAGES.CUSTOMER_SUSPENDED };
      return { success, message: SUCCESS_MESSAGES.CUSTOMER_IS_VERIFIED };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
