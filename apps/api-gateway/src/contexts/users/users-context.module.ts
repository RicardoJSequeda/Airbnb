import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { FavoritesModule } from '../../favorites/favorites.module';

@Module({
  imports: [AuthModule, FavoritesModule],
  exports: [AuthModule, FavoritesModule],
})
export class UsersContextModule {}
