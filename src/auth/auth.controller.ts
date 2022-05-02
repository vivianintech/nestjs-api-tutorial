import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup') // this is called route
  // signup(@Req() req: Request) {

  // signup(
  //   @Body('email') email: string,
  //   @Body('password', ParseIntPipe) // ParseIntPipe is for parsing integer only for the field
  //   password: string,
  // ) {
  signup(@Body() dto: AuthDto) {
    // when using @Body, you don't have to worry if it comes from fastify or express
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
