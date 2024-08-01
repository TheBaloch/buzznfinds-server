import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

const createAdmin = async () => {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({
      where: { role: "admin" },
    });

    const newPassword = "hi@nattynyc";

    if (!adminUser) {
      const admin = new User();
      admin.email = "hi@nattynyc.com";
      admin.password = newPassword;
      admin.username = "Admin";
      admin.role = "admin";

      await userRepository.save(admin);
      console.log("Admin user created successfully!");
    } else {
      adminUser.password = newPassword;
      await userRepository.save(adminUser);
      console.log("Admin user's password updated successfully!");
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error creating or updating admin user:", error);
    process.exit(1);
  }
};

createAdmin().then(() => process.exit(0));
