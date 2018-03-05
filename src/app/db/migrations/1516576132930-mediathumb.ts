import {MigrationInterface, QueryRunner} from "typeorm";

export class mediathumb1516576132930 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Adding thumb_s3key to table media (defaulting to "" for existing entries')
        await queryRunner.query(`ALTER TABLE media ADD COLUMN thumb_s3key VARCHAR(64) NOT NULL DEFAULT ''`)
        await queryRunner.query(`ALTER TABLE media ALTER COLUMN thumb_s3key DROP DEFAULT`)

        console.log('Fixing s3key column type in table media') // no need to reverse; old size was just silly
        await queryRunner.query(`ALTER TABLE media ALTER COLUMN s3key TYPE VARCHAR(64)`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Dropping thumb_s3key from table media')
        await queryRunner.query(`ALTER TABLE media DROP COLUMN thumb_s3key`)
    }

}
