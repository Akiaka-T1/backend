import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../user/entity/User";
import { UserRepository } from "../../user/repository/UserRepository";
import { UserService } from "../../user/service/UserService";
import { Role } from "../../../auth/authorization/Role";


@Injectable()
export class AdminService implements OnModuleInit{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(UserRepository)
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    await this.createAdminUser();
  }

  private async createAdminUser(): Promise<void> {

    const adminEmail = process.env.NEST_ADMIN_EMAIL;
    if (adminEmail !=='' && await this.checkAdminNotExists(adminEmail)){
    const adminPassword = process.env.NEST_ADMIN_PASSWORD;

    const adminUser = this.userRepository.create({
      name: 'Admin',
      nickname: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: Role.Admin,
    });

    await this.userRepository.save(adminUser);
    }
  }
  private async checkAdminNotExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !user;
  }
}