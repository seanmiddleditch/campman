import {MigrationInterface, QueryRunner} from "typeorm";

export class MapUpdates1517814491996 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE map
            DROP CONSTRAINT map_ref_media,
            DROP COLUMN media_id,
            ADD COLUMN slug VARCHAR(32),
            ADD COLUMN storage_id BIGINT,
            ADD CONSTRAINT map_unique_slug UNIQUE(library_id, slug),
            ADD CONSTRAINT map_ref_media_storage FOREIGN KEY(storage_id) REFERENCES media_storage(id) ON DELETE CASCADE
        `)
        await queryRunner.query(`UPDATE map SET
            slug=regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'),
            storage_id=1
        `)
        await queryRunner.query(`ALTER TABLE map
            ALTER COLUMN slug SET NOT NULL,
            ALTER COLUMN storage_id SET NOT NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE map
            DROP CONSTRAINT map_ref_media_storage,
            DROP COLUMN storage_id,
            DROP CONSTRAINT map_unique_slug,
            DROP COLUMN slug,
            ADD COLUMN media_id BIGINT,
            ADD CONSTRAINT map_ref_media FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
        `)
    }

}
