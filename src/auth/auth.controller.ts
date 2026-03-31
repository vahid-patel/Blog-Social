import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, VerifyOtpDto } from './authDto/signup.dto';
import { ForgotPassDto, LoginDto, ResetPassDto } from './authDto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupData: SignupDto) {
    return this.authService.signUp(signupData);
  }

  @Post('verify-otp')
  verifyOtp(@Body() OtpData: VerifyOtpDto) {
    return this.authService.verifyOtp(OtpData);
  }

  @Post('login')
  login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Post('forgot-password')
  forgotPass(@Body() forgotPassData: ForgotPassDto) {
    return this.authService.forgotPass(forgotPassData);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPassData: ResetPassDto) {
    return this.authService.resetPass(resetPassData);
  }
}
