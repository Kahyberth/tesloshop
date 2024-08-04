import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser, RawHeaders, Auth, RoleProtected } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './enums/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  signIn(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  privateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: User,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Hello, Welcome to private route',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privatesRoutes(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hi, welcome to private2',
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoutesThree(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hi, welcome to private3',
      user,
    };
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user.id);
  }
}
