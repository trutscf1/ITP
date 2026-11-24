#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/03d11f2141acff97e569a9e19b11b0cb9370016feb58cec31008be52b1334ab9/contract';
import endContract from '../../snapshots/03d11f2141acff97e569a9e19b11b0cb9370016feb58cec31008be52b1334ab9/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d53d54568adb82119e7091260de3c25ea0dcc6de2123ef822f99d0e9922600ad/contract';
import startContract from '../../snapshots/d53d54568adb82119e7091260de3c25ea0dcc6de2123ef822f99d0e9922600ad/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'folders',
        constraint: 'folders_parent_id_fkey',
        kind: 'foreignKey',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'folders',
        index: 'folders_parent_id_idx_ab33b399',
      }),
      this.addUnique({
        schema: 'public',
        table: 'folders',
        constraint: 'folders_id_team_id_key',
        columns: ['id', 'team_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'folders',
        index: 'folders_parent_id_team_id_idx_18cc5ccc',
        columns: ['parent_id', 'team_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'folders',
        foreignKey: {
          name: 'folders_parent_id_team_id_fkey',
          columns: ['parent_id', 'team_id'],
          references: { schema: 'public', table: 'folders', columns: ['id', 'team_id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
