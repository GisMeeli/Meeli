import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupCollaboratorModel } from '../../../models/group-collaborator.model';
import { GroupEntity } from './group.entity';

@Entity({ name: 'group_collaborator' })
export class GroupCollaboratorEntity implements GroupCollaboratorModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => GroupEntity, (group) => group.collaborators)
  @Column({ name: 'group' })
  group: string;

  @Column({ name: 'name', type: 'character varying', length: 32, nullable: false })
  name: string;

  @Column({ name: 'key', type: 'character varying', length: 32, nullable: false })
  key: string;

  @Column({ name: 'creation', type: 'timestamp', nullable: false, default: () => 'now()' })
  creation: Date;
}
