import {MigrationInterface, QueryRunner} from "typeorm";

export class Characters1517892616516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE character(
            id BIGSERIAL,
            library_id BIGINT NOT NULL,
            slug VARCHAR(128),
            title VARCHAR(128) NOT NULL,
            visible BOOLEAN DEFAULT FALSE,
            alive BOOLEAN DEFAULT TRUE,
            portrait_id BIGINT,
            rawbody TEXT NOT NULL,
            CONSTRAINT character_id PRIMARY KEY(id),
            CONSTRAINT character_unique_slug UNIQUE(slug, library_id),
            CONSTRAINT character_ref_library FOREIGN KEY(library_id) REFERENCES library(id) ON DELETE CASCADE,
            CONSTRAINT character_ref_media_storage FOREIGN KEY(portrait_id) REFERENCES media_storage(id) ON DELETE SET NULL
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE character`)
    }

}
