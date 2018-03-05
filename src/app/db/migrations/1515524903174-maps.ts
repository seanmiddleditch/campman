import {MigrationInterface, QueryRunner} from "typeorm";

export class maps1515524903174 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log('Creating table map')
        await queryRunner.query(`CREATE TABLE map (
            id BIGSERIAL,
            library_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            media_id BIGINT NOT NULL,
            rawbody TEXT NOT NULL,
            CONSTRAINT map_id PRIMARY KEY(id),
            CONSTRAINT map_ref_library FOREIGN KEY (library_id) REFERENCES library(id),
            CONSTRAINT map_ref_media FOREIGN KEY (media_id) REFERENCES media(id)
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Dropping table map')
        await queryRunner.query(`DROP TABLE map`)
    }

}
