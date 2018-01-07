import {Entity, Column, OneToMany, PrimaryGeneratedColumn, Index, EntityRepository, Repository} from 'typeorm'
import {Membership} from './membership-model'

@Entity()
export class User
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column()
    public fullName: string

    @Column()
    public nickname: string

    @Column()
    @Index({unique: true})
    public email: string

    @Column()
    public photoURL: string

    @OneToMany(t => Membership, m => m.user)
    public membership: Membership[]
    
    @Column({nullable: true, unique: true})
    public googleId?: string
}

@EntityRepository(User)
export class UserRepository extends Repository<User>
{
    public async findOrCreateForGoogle(options: {googleId: string, fullName: string, email: string, photoURL: string})
    {
        let user = await this.findOne({
            where: {
                googleId: options.googleId
            }
        })

        if (!user)
        {
            user = new User()
            user.googleId = options.googleId
            user.nickname = options.fullName
        }

        user.fullName = options.fullName
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