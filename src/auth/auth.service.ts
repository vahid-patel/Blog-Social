import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/UserSchema/User.schema';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../common/mailer/mail.service';
import { Model } from 'mongoose';
import { SignupDto, VerifyOtpDto } from './authDto/signup.dto';
import * as bcrypt from 'bcrypt';
import { generateOtp } from '../common/utils/otp.util';
import { ForgotPassDto, LoginDto, ResetPassDto } from './authDto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: any,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async signUp(signupData: SignupDto) {
    const { email, password, role, name } = signupData;

    const isUser = await this.userModel.findOne({ email });

    if (isUser) {
      throw new BadRequestException('User already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      verified: false,
      otp,
      otpExpires,
    });

    await this.mailerService.sendOtpToEmail(email, otp);
    return { Message: 'User registered. Please Check your email for OTP' };
  }

  async verifyOtp(otpData: VerifyOtpDto) {
    const { email, otp } = otpData;

    const user = await this.userModel.findOne({ email });

    if (!user) throw new BadRequestException('User Not found');
    if (user.verified) throw new BadRequestException('Already Verified');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (user.otpExpires < new Date())
      throw new BadRequestException('OTP Expired');

    user.verified = true;

    await this.userModel.updateOne(
      { email },
      { $unset: { otp: '', otpExpires: '' } },
    );

    await user.save();

    return { message: 'Email Verified Successfully' };
  }

  async login(loginData: LoginDto) {
    const { email, password } = loginData;

    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('Wrong Credentials');

    if (!user.verified)
      throw new UnauthorizedException('Please verify your Email First');

    const isPassMatch = await bcrypt.compare(password, user.password);

    if (!isPassMatch) throw new UnauthorizedException('Wrong Credentials');

    const payload = {
      userId: user._id,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    console.log(token);

    return {
      token: token,
    };
  }

  async forgotPass(forgotPassData: ForgotPassDto) {
    const { email } = forgotPassData;

    const user = await this.userModel.findOne({ email });

    if (!user) throw new NotFoundException('User not Exist');

    const token = crypto.randomBytes(32).toString('hex');

    await this.redisClient.set(`resetToken:${user._id}`, token, 'EX', 900);

    const resetLink = `http://localhost:3000/reset-password?token=${token}&userId=${user._id}`;

    await this.mailerService.sendLinkToEmail(email, resetLink);

    return { message: 'Password reset link sent to your email' };
  }

  async resetPass(resetPassData: ResetPassDto) {
    const { userId, token, newPassword } = resetPassData;

    const storedToken = await this.redisClient.get(`resetToken:${userId}`);

    if (!storedToken) throw new BadRequestException('Invalid or Token Expired');

    if (storedToken !== token) throw new BadRequestException('Invalid Token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    await this.redisClient.del(`resetToken:${userId}`);

    return { message: 'Password reset successful' };
  }
}
