import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export abstract class CommonEntity {
  static readonly DEFAULT_AVATAR = 'https://i.pravatar.cc/300';

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    const obj: any = { ...this };

    if (this.createdAt instanceof Date) {
      obj.createdAt = this.createdAt.toISOString();
    }

    if (this.updatedAt instanceof Date) {
      obj.updatedAt = this.updatedAt.toISOString();
    }

    for (const key in obj) {
      const val = obj[key];
      if (val && typeof val === 'object' && typeof val.toJSON === 'function') {
        obj[key] = val.toJSON();
      }

      if (Array.isArray(val)) {
        obj[key] = val.map((el) =>
          el && typeof el === 'object' && typeof el.toJSON === 'function'
            ? el.toJSON()
            : el,
        );
      }
    }

    return obj;
  }
}
