import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, Index, ManyToOne, OneToMany, EntityRepository, JoinColumn, Repository, Connection} from 'typeorm'
import {Library} from './library-model'
import {User} from './user-model'
import {Role} from '../auth'

@Entity()
export class Membership
{
    @PrimaryColumn({name: 'library_id'})
    public libraryId: number

    @ManyToOne(t => Library, l => l.memberships)
    @JoinColumn({name: 'library_id'})
    public library: Library

    @PrimaryColumn({name: 'account_id'})
    public accountId: number

    @ManyToOne(t => User, u => u.membership)
    @JoinColumn({name: 'account_id'})
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
                accountId: options.userID,
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
                accountId: params.userID,
                libraryId: params.libraryID,
                role: params.role
            })
            .execute()
    }
}