import {MigrationInterface, QueryRunner} from "typeorm";

export class removesubtitles1516260154401 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Dropping note subtitle column')
        await queryRunner.query('ALTER TABLE note DROP COLUMN subtitle')
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Adding note subtitle column')
        await queryRunner.query('ALTER TABLE note ADD COLUMN subtitle VARCHAR(255)')
    }

}
