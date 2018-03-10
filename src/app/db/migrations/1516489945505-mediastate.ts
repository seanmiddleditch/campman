import {MigrationInterface, QueryRunner} from "typeorm";

export class mediastate1516489945505 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Creating enum mediastate')
        await queryRunner.query(`CREATE TYPE mediastate AS ENUM('Ready', 'Pending', 'Deleted')`)

        console.log('Adding state column to table media')
        await queryRunner.query(`ALTER TABLE media ADD COLUMN state mediastate NOT NULL DEFAULT 'Pending'`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Dropping state column from table media')
        await queryRunner.query(`ALTER TABLE media DROP COLUMN state`)

        console.log('Dropping enum mediastate')
        await queryRunner.query(`DROP TYPE mediastate`)
    }

}
