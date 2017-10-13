import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Index, ManyToOne, OneToMany, EntityRepository, JoinColumn, Repository, Connection} from 'typeorm'
import {Note} from './note-model'
import {User} from './user-model'
import {Membership} from './membership-model'
import {Invitation} from './invite-model'
import {Role} from '../auth/access'

export enum LibraryVisibility
{
    Public = 'Public',
    Hidden = 'Hidden'
}

@Entity()
@Index(['id', 'slug'], {unique: true})
export class Library
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public slug: string

    @Column()
    public title: string

    @Column()
    public visibility: LibraryVisibility

    @OneToMany(t => Note, n => n.library)
    public notes: Note[]

    @OneToMany(t => Membership, m => m.library)
    public memberships: Membership[]

    @OneToMany(t => Invitation, i => i.library)
    public invitations: Invitation[]
}

@EntityRepository(Library)
export class LibraryRepository extends Repository<Library>
{
    public async findAllForUser({userID}: {userID: number})
    {
        return this.createQueryBuilder('library')
            .leftJoinAndMapOne('role', 'library.memberships', 'membership', 'membership.userId=:userID', {userID})
            .getRawMany()
            .then(results => results.map(row => ({
                    id: row.library_id as number,
                    slug: row.library_slug as string,
                    title: row.library_title as string,
                    visibility: row.library_visibility as LibraryVisibility,
                    role: row.membership_role as Role
                })))
    }

    public async findBySlug({slug, withMembers}: {slug: string, withMembers?: boolean})
    {
        return this.findOne({
            where: {
                slug
            },
            relations: ['memberships']
        })
    }

    public static async createLibrary(conn: Connection, {slug, title, creatorID}: {slug: string, title: string, creatorID: number})
    {
        return conn.transaction(async (tx) => {
            const libraries = tx.getCustomRepository(LibraryRepository)
            const library = libraries.create({
                slug,
                title,
                visibility: LibraryVisibility.Public
            })
            await libraries.save(library)
            
            const memberships = tx.getRepository(Membership)
            const member = memberships.create({
                userId: creatorID,
                libraryId: library.id,
                role: Role.Owner
            })
            await memberships.save(member)

            return library
        })
    }

    public async updateLibrary({slug, title, visibility}: {slug: string, title?: string, visibility?: LibraryVisibility})
    {
        await this.createQueryBuilder('library')
            .where('"slug"=:slug', {slug})
            .update({
                title,
                visibility
            })
            .execute()
    }
}