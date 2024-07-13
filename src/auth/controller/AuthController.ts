import { Body, Controller, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../service/AuthService";
import { LoginDto } from "../dto/LoginDto";

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: any) {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }

  @Post('refresh')
  async refresh(@Req() req) {
    if(!req.cookies) throw new UnauthorizedException('Cookies not found');
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return await this.authService.refreshToken(refreshToken);
  }
}