import {Entity, Column, OneToMany, PrimaryGeneratedColumn, Index, EntityRepository, Repository} from 'typeorm'
import {MembershipModel} from './membership-model'

@Entity({name: 'account'})
export class AccountModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public fullname: string

    @Column()
    public nickname: string

    @Column()
    @Index({unique: true})
    public email: string

    @Column({name: 'photo_url'})
    public photoURL: string

    @OneToMany(t => MembershipModel, m => m.user)
    public membership: MembershipModel[]
    
    @Column({nullable: true, unique: true, name: 'google_id'})
    public googleId?: string
}

@EntityRepository(AccountModel)
export class UserRepository extends Repository<AccountModel>
{
    public async findOrCreateForGoogle(options: {googleId: string, fullname: string, email: string, photoURL: string})
    {
        let user = await this.findOne({
            where: {
                googleId: options.googleId
            }
        })

        if (!user)
        {
            user = new AccountModel()
            user.googleId = options.googleId
            user.nickname = options.fullname
        }

        user.fullname = options.fullname
        user.email = options.email
        user.photoURL = options.photoURL

        await this.save(user)
        return user
    }

    public async updateUser({userID, nickname}: {userID: number, nickname?: string})
    {
        await this.createQueryBuilder('user')
            .update({
                nickname
            })
            .where('"id"=:id', {id: userID})
            .printSql()
            .execute()

    }
}