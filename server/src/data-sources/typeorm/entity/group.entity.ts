import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GroupModel } from '../../../models/group.model';

@Entity()
export class GroupEntity implements GroupModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'hashtag',
    type: 'character varying',
    length: 48,
    nullable: false,
    unique: true
  })
  hashtag: string;

  @Column({
    name: 'access_codes',
    type: 'json',
    nullable: false,
    default: '{}'
  })
  accessCodes: JSON;

  @Column({
    name: 'creation',
    type: 'timestamp',
    nullable: false,
    default: () => 'now()'
  })
  creation: Date;
}
