import { Module } from '@nestjs/common';
import { PropertiesModule } from '../../properties/properties.module';
import { ExperiencesModule } from '../../experiences/experiences.module';
import { LocationsModule } from '../../locations/locations.module';
import { ReviewsModule } from '../../reviews/reviews.module';

@Module({
  imports: [PropertiesModule, ExperiencesModule, LocationsModule, ReviewsModule],
  exports: [PropertiesModule, ExperiencesModule, LocationsModule, ReviewsModule],
})
export class ListingsContextModule {}
