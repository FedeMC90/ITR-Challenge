import { Body, Controller, Post, Get } from '@nestjs/common';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { AssignRoleDto } from '../dto/role.dto';
import { RoleIds } from '../enum/role.enum';
import { RoleService } from '../services/role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Auth(RoleIds.Admin)
  @Post('assign')
  async assignRoleToUser(@Body() body: AssignRoleDto) {
    return this.roleService.assignRoleToUser(body);
  }

  @Auth(RoleIds.Admin)
  @Post('remove')
  async removeRoleFromUser(@Body() body: AssignRoleDto) {
    return this.roleService.removeRoleFromUser(body);
  }

  @Auth(RoleIds.Admin)
  @Get()
  async getAllRoles() {
    return this.roleService.findAll();
  }
}
