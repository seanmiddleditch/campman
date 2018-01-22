import {MigrationInterface, QueryRunner} from "typeorm";

export class splitmedia1516587764846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Creating split media tables')
        queryRunner.query(`CREATE TABLE media_storage (
            id BIGSERIAL,
            s3key VARCHAR(64) NOT NULL,
            thumb_s3key VARCHAR(64) NOT NULL,
            content_md5 CHAR(32) NOT NULL,
            state mediastate NOT NULL DEFAULT 'Pending',
            CONSTRAINT media_storage_id PRIMARY KEY(id),
            CONSTRAINT media_storage_unique_content_md5 UNIQUE(content_md5)
        )`)
        queryRunner.query(`ALTER TABLE media
            ADD COLUMN storage_id BIGINT,
            ADD CONSTRAINT media_ref_media_storage FOREIGN KEY(storage_id) REFERENCES media_storage(id) ON DELETE CASCADE
        `)

        console.log('Moving media content into new table (with fake content MD5)')
        queryRunner.query(`INSERT INTO media_storage
            (s3key, thumb_s3key, content_md5, state)
            SELECT s3key, thumb_s3key, split_part(split_part(s3key, '/', 2), '.', 1), state
            FROM media
            ON CONFLICT DO NOTHING
        `)
        queryRunner.query(`UPDATE media SET storage_id=storage.id FROM media_storage storage WHERE storage.s3key=media.s3key`)

        console.log('Cleaning up media')
        queryRunner.query(`ALTER TABLE media
            ALTER COLUMN storage_id SET NOT NULL,
            DROP COLUMN s3key,
            DROP COLUMN thumb_s3key,
            DROP COLUMN state
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Merging media_storage into media')
        queryRunner.query(`ALTER TABLE media
            ADD COLUMN s3key VARCHAR(64),
            ADD COLUMN thumb_s3key VARCHAR(64),
            ADD COLUMN state mediastate NOT NULL DEFAULT 'Pending'
        `)
        queryRunner.query(`UPDATE MEDIA
            SET s3key=storage.s3key, thumb_s3key=storage.thumb_s3key, state=storage.state
            FROM media_storage storage
            WHERE storage.id=storage_id
        `)
        queryRunner.query(`ALTER TABLE media
            ALTER COLUMN s3key SET NOT NULL,
            ALTER COLUMN thumb_s3key SET NOT NULL,
            DROP CONSTRAINT media_ref_media_storage,
            DROP COLUMN storage_id
        `)
        queryRunner.query(`DROP TABLE media_storage`)
    }

}
