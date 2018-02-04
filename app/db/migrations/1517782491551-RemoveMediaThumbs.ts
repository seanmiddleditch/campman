import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveMediaThumbs1517782491551 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Removing thumb_s3key from table media_storage')
        queryRunner.query(`ALTER TABLE media_storage DROP COLUMN thumb_s3key`)
    }
    
    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Adding thumb_s3key to table media_storage (defaulting to "" for existing entries)')
        queryRunner.query(`ALTER TABLE media_storage ADD COLUMN thumb_s3key VARCHAR(64) NOT NULL DEFAULT ''`)
        queryRunner.query(`ALTER TABLE media_storage ALTER COLUMN thumb_s3key DROP DEFAULT`)
    }

}
