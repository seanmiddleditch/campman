import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Index, ManyToOne, OneToMany, EntityRepository, JoinColumn, Repository, Connection} from 'typeorm'
import {Library} from './library-model'
import {User} from './user-model'
import {Role} from '../auth'

@Entity()
export class Membership
{
    @PrimaryColumn()
    public libraryId: number

    @ManyToOne(t => Library, l => l.memberships)
    @JoinColumn()
    public library: Library

    @PrimaryColumn()
    public userId: number

    @ManyToOne(t => User, u => u.membership)
    @JoinColumn()
    public user: User

    @Column()
    public role: Role
}

@EntityRepository(Membership)
export class MembershipRepository extends Repository<Membership>
{
    public async findRoleForUser(options: {userID: number, libraryID: number})
    {
        const rs = await this.findOne({
            where: {
                userId: options.userID,
                libraryId: options.libraryID
            }
        })
        return rs ? rs.role : Role.Visitor
    }

    public async findMembersForLibrary({libraryID}: {libraryID: number})
    {
        const memberships = await this.createQueryBuilder('membership')
            .innerJoinAndSelect('membership.user', 'user')
            .getMany()
        return memberships.map(membership => ({
            role: membership.role,
            ...membership.user
        }))
    }

    public async updateRole(params: {userID: number, libraryID: number, role: Role})
    {
        await this.createQueryBuilder('membership')
            .update({
                userId: params.userID,
                libraryId: params.libraryID,
                role: params.role
            })
            .execute()
    }
}