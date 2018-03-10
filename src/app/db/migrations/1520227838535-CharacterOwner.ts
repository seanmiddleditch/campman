import {MigrationInterface, QueryRunner} from "typeorm";

export class CharacterOwner1520227838535 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE character
            ADD COLUMN owner_id BIGINT,
            ADD CONSTRAINT character_ref_profile FOREIGN KEY (owner_id) REFERENCES account(id) ON DELETE CASCADE
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE character
            DROP CONSTRAINT character_ref_profile,
            DROP COLUMN owner_id
        `)
    }

}
