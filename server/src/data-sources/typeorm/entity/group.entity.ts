import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GroupCategoryModel } from '../../../models/group-category.model';
import { GroupModel } from '../../../models/group.model';
import { GroupCollaboratorEntity } from './group-collaborator.entity';

@Entity({ name: 'group' })
export class GroupEntity implements GroupModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hashtag', type: 'character varying', length: 48, nullable: false, unique: true })
  hashtag: string;

  @Column({ name: 'name', type: 'character varying', length: 48, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'character varying', length: 1024, nullable: true })
  description: string;

  @Column({ name: 'admin_key', type: 'character varying', length: 32, nullable: false })
  adminKey: string;

  @Column({ name: 'category', type: 'smallint', nullable: false })
  @Check(`"category" = 1 OR "category" = 2`)
  category: GroupCategoryModel;

  @Column({ name: 'custom_attributes', type: 'json', nullable: false, default: '{ }' })
  customAttributes: JSON;

  @Column({ name: 'creation', type: 'timestamp', nullable: false, default: () => 'now()' })
  creation: Date;

  @OneToMany(() => GroupCollaboratorEntity, (collaborator) => collaborator.group)
  collaborators: GroupCollaboratorEntity[];
}
