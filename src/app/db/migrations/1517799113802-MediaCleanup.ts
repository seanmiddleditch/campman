import {MigrationInterface, QueryRunner} from "typeorm";

export class MediaCleanup1517799113802 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Dropping state column from media_storage')
        await queryRunner.query(`ALTER TABLE media_storage DROP COLUMN state`)

        console.log('Dropping enum mediastate')
        await queryRunner.query(`DROP TYPE mediastate`)

        console.log('Altering media_storage')
        await queryRunner.query(`ALTER TABLE media_storage
            ADD COLUMN extension VARCHAR(4) NOT NULL DEFAULT '',
            ADD COLUMN byte_length INT NOT NULL DEFAULT 0,
            ADD COLUMN image_width INT,
            ADD COLUMN image_height INT
        `)

        await queryRunner.query(`UPDATE media_storage SET extension=split_part(s3key, '.', 2)`)

        await queryRunner.query(`ALTER TABLE media_storage
            ALTER COLUMN extension DROP DEFAULT,
            DROP COLUMN s3key
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Creating enum mediastate')
        await queryRunner.query(`CREATE TYPE mediastate AS ENUM('Ready', 'Pending', 'Deleted')`)

        console.log('Adding state column to table media')
        await queryRunner.query(`ALTER TABLE media ADD COLUMN state mediastate NOT NULL DEFAULT 'Pending'`)

        console.log('Altering media_storage')
        await queryRunner.query(`ALTER TABLE media_storage
            ADD COLUMN s3key VARCHAR(255)
        `)

        await queryRunner.query(`UPDATE media_storage SET s3key='media/' || content_md5 || '.' || extension`)

        await queryRunner.query(`ALTER TABLE media_storage
            DROP COLUMN extension,
            DROP COLUMN byte_length,
            DROP COLUMN image_width,
            DROP COLUMN image_height
        `)
    }

}
