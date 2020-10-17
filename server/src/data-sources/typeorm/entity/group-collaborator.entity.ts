import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { GroupCollaboratorModel } from '../../../models/group-collaborator.model';
import { GroupEntity } from './group.entity';

@Entity({ name: 'group_collaborator' })
export class GroupCollaboratorEntity implements GroupCollaboratorModel {
  @OneToMany(() => GroupEntity, (group) => group.collaborators)
  @PrimaryColumn({ name: 'group' })
  group: string;

  @Column({
    name: 'key',
    type: 'character varying',
    length: 32,
    nullable: false
  })
  key: string;

  @Column({
    name: 'creation',
    type: 'timestamp',
    nullable: false,
    default: () => 'now()'
  })
  creation: Date;
}
