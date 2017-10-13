import {Entity, Column, ManyToOne, JoinTable, EntityRepository, Repository} from 'typeorm'
import {Library} from './library-model'

@Entity()
export class Invitation
{
    @Column({primary: true, length: 24})
    public id: string

    @Column()
    public email: string

    @Column()
    public libraryId: number

    @ManyToOne(type => Library, l => l.invitations)
    @JoinTable()
    public library: Library
}

@EntityRepository(Invitation)
export class InvitationRepository extends Repository<Invitation>
{
    public async createInvitation(params: {id: string, email: string, libraryID: number})
    {
        await this.create({
            id: params.id,
            email: params.email,
            libraryId: params.libraryID
        })
    }
}
