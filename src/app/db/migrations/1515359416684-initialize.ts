import {Connection, EntityManager, MigrationInterface, QueryRunner, Table, TableColumn, TablePrimaryKey, TableForeignKey} from 'typeorm';

export class initialize1515359416684 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE visibility AS ENUM('Public', 'Hidden')`)
        await queryRunner.query(`CREATE TYPE accessrole AS ENUM('Owner', 'GameMaster', 'Player', 'Visitor')`)

        console.log('Creating table user')
        await queryRunner.query(`CREATE TABLE account (
            id BIGSERIAL,
            fullname VARCHAR(255) NOT NULL,
            nickname VARCHAR(64) NOT NULL,
            email VARCHAR(255) NOT NULL,
            photo_url VARCHAR(255),
            google_id NUMERIC,
            CONSTRAINT account_id PRIMARY KEY(id),
            CONSTRAINT account_unique_email UNIQUE(email),
            CONSTRAINT account_unique_googleId UNIQUE(google_id)
        )`)
        
        console.log('Creating table library')
        await queryRunner.query(`CREATE TABLE library (
            id BIGSERIAL,
            title VARCHAR(128) NOT NULL,
            slug VARCHAR(128) NOT NULL,
            visibility visibility NOT NULL DEFAULT 'Hidden',
            CONSTRAINT library_id PRIMARY KEY(id),
            CONSTRAINT library_unique_slug UNIQUE(slug)
        )`)

        console.log('Creating table note')
        await queryRunner.query(`CREATE TABLE note (
            id BIGSERIAL,
            library_id BIGINT NOT NULL,
            author_id BIGINT,
            slug VARCHAR(128),
            title VARCHAR(255) NOT NULL,
            visibility visibility NOT NULL DEFAULT 'Hidden',
            subtitle VARCHAR(255),
            rawbody TEXT NOT NULL,
            CONSTRAINT note_id PRIMARY KEY(id),
            CONSTRAINT note_unique_sluq UNIQUE(library_id, slug),
            CONSTRAINT note_ref_library FOREIGN KEY(library_id) REFERENCES library(id) ON DELETE CASCADE,
            CONSTRAINT note_ref_account FOREIGN KEY(author_id) REFERENCES account(id) ON DELETE SET NULL
        )`)

        console.log('Creating table label')
        await queryRunner.query(`CREATE TABLE label (
            id BIGSERIAL,
            slug VARCHAR(128),
            CONSTRAINT label_id PRIMARY KEY(id),
            CONSTRAINT label_slug UNIQUE(slug)
        )`)

        console.log('Creating table note_labels')
        await queryRunner.query(`CREATE TABLE note_labels (
            note_id BIGINT NOT NULL,
            label_id BIGINT NOT NULL,
            CONSTRAINT note_labels_ref_note FOREIGN KEY(note_id) REFERENCES note(id) ON DELETE CASCADE,
            CONSTRAINT note_labels_ref_label FOREIGN KEY(label_id) REFERENCES label(id) ON DELETE CASCADE
        )`)

        console.log('Creating table membership')
        await queryRunner.query(`CREATE TABLE membership (
            library_id BIGINT NOT NULL,
            account_id BIGINT NOT NULL,
            role accessrole NOT NULL,
            CONSTRAINT membership_unique_user_library UNIQUE(library_id, account_id),
            CONSTRAINT membership_ref_account FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE,
            CONSTRAINT membership_ref_library FOREIGN KEY(library_id) REFERENCES library(id) ON DELETE CASCADE
        )`)

        console.log('Creating table media')
        await queryRunner.query(`CREATE TABLE media (
            id BIGSERIAL,
            path VARCHAR(255) NOT NULL,
            s3key VARCHAR(1024) NOT NULL,
            library_id BIGINT,
            caption VARCHAR(255),
            attribution VARCHAR(255),
            CONSTRAINT media_id PRIMARY KEY(id),
            CONSTRAINT media_unique_path UNIQUE(library_id, path),
            CONSTRAINT media_library FOREIGN KEY(library_id) REFERENCES library(id) ON DELETE SET NULL
        )`)

        console.log('Creating table media_labels')
        await queryRunner.query(`CREATE TABLE media_labels (
            media_id BIGINT NOT NULL,
            label_id BIGINT NOT NULL,
            CONSTRAINT media_labels_ref_note FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE,
            CONSTRAINT media_labels_ref_label FOREIGN KEY(label_id) REFERENCES label(id) ON DELETE CASCADE
        )`)

        console.log('Creating table invitations')
        await queryRunner.query(`CREATE TABLE invitation (
            id VARCHAR(24) NOT NULL,
            email VARCHAR(255) NOT NULL,
            library_id BIGINT NOT NULL,
            CONSTRAINT invitation_id PRIMARY KEY(id),
            CONSTRAINT membership_ref_library FOREIGN KEY(library_id) REFERENCES library(id) ON DELETE CASCADE 
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log('Dropping all tables')
        await queryRunner.query(`DROP TYPE visibility`)
        await queryRunner.query(`DROP TYPE accessrole`)
        await queryRunner.query(`DROP TABLE account`)
        await queryRunner.query(`DROP TABLE library`)
        await queryRunner.query(`DROP TABLE note`)
        await queryRunner.query(`DROP TABLE label`)
        await queryRunner.query(`DROP TABLE note_labels`)
        await queryRunner.query(`DROP TABLE membership`)
        await queryRunner.query(`DROP TABLE media`)
        await queryRunner.query(`DROP TABLE media_labels`)
        await queryRunner.query(`DROP TABLE invitation`)
    }

}
