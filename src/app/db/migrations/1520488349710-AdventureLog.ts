import {MigrationInterface, QueryRunner} from "typeorm";

export class AdventureLog1520488349710 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE adventure(
            id BIGSERIAL,
            campaign_id BIGINT NOT NULL,
            title VARCHAR(128) NOT NULL,
            visible BOOLEAN DEFAULT FALSE,
            rawbody TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            CONSTRAINT adventures_id PRIMARY KEY(id),
            CONSTRAINT character_ref_campaign FOREIGN KEY(campaign_id) REFERENCES library(id) ON DELETE CASCADE
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('DROP TABLE adventure')
    }

}
