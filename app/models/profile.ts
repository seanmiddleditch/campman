import {Entity, Column, OneToMany, PrimaryGeneratedColumn, Index, EntityRepository, Repository} from 'typeorm'
import {MembershipModel} from './membership-model'

@Entity({name: 'account'})
export class ProfileModel
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

    @OneToMany(t => MembershipModel, m => m.profile)
    public membership: MembershipModel[]
    
    @Column({nullable: true, unique: true, name: 'google_id'})
    public googleId?: string
}

@EntityRepository(ProfileModel)
export class ProfileRepository extends Repository<ProfileModel>
{
    public async findOrCreateForGoogle(options: {googleId: string, fullname: string, email: string, photoURL: string})
    {
        let profile = await this.findOne({
            where: {
                googleId: options.googleId
            }
        })

        if (!profile)
        {
            profile = new ProfileModel()
            profile.googleId = options.googleId
            profile.nickname = options.fullname
        }

        profile.fullname = options.fullname
        profile.email = options.email
        profile.photoURL = options.photoURL

        await this.save(profile)
        return profile
    }

    public async updateProfile({profileId, nickname}: {profileId: number, nickname?: string})
    {
        await this.createQueryBuilder('user')
            .update({
                nickname
            })
            .where('"id"=:profileId', {profileId})
            .printSql()
            .execute()

    }
}