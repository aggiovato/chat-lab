import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/requests/update-user.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';
import { UserSearchQueryDto } from '../dto/requests/user-search-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User): UserResponseDto {
    return new UserResponseDto(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.update(user.id, dto);
    return new UserResponseDto(updated);
  }

  @Get('search')
  async search(@Query() query: UserSearchQueryDto): Promise<UserResponseDto[]> {
    const users = await this.usersService.search(query.query ?? '');
    return users.map((u) => new UserResponseDto(u));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByIdOrThrow(id);
    return new UserResponseDto(user);
  }
}
