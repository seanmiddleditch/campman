import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Repository, EntityRepository, ManyToMany, OneToMany, ManyToOne, JoinTable, JoinColumn, Index } from 'typeorm'
import { TagModel } from './tag'
import { CampaignModel } from './campaign'

@Entity({ name: 'media_storage' })
@Index(['contentMD5'])
export class MediaStorageModel {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({ name: 'content_md5' })
    public contentMD5: string

    @Column()
    public extension: string

    @Column({name: 'byte_length'})
    public byteLength: number

    @Column({name: 'image_width'})
    public imageWidth?: number

    @Column({name: 'image_height'})
    public imageHeight?: number

    @OneToMany(t => MediaModel, m => m.campaign)
    public media: MediaModel[]
}

@Entity({ name: 'media' })
@Index(['campaignId', 'path'])
export class MediaModel {
    @PrimaryGeneratedColumn()
    public id: number

    @PrimaryColumn()
    public path: string

    @Column({ name: 'storage_id' })
    public storageId: number

    @ManyToOne(t => MediaStorageModel)
    @JoinColumn({ name: 'storage_id' })
    public storage: MediaStorageModel

    @PrimaryColumn({ name: 'library_id' })
    public campaignId: number

    @ManyToOne(t => CampaignModel)
    @JoinColumn({ name: 'library_id' })
    public campaign: CampaignModel

    @Column()
    public caption: string

    @Column()
    public attribution: string

    @ManyToMany(t => TagModel)
    @JoinTable({ name: 'media_labels', joinColumn: { name: 'label_id' }, inverseJoinColumn: { name: 'media_id' } })
    public tags: TagModel[]
}

@EntityRepository(MediaStorageModel)
export class MediaStorageRepository extends Repository<MediaStorageModel>
{
    public async getOrCreateForImage(data: {hashHexMD5: string, extension: string, size: number, imageWidth: number, imageHeight: number})
    {
        const {hashHexMD5, extension, size, imageWidth, imageHeight} = data

        // find existing storage or create it if necessary
        let storage = await this.createQueryBuilder('storage')
            .select(['id'])
            .where('content_md5=:md5', {md5: hashHexMD5})
            .printSql()
            .getRawOne()
        if (!storage)
        {
            storage = this.create({
                contentMD5: hashHexMD5,
                extension,
                byteLength: size,
                imageWidth: imageWidth,
                imageHeight: imageHeight,
            })
            storage = await this.save(storage)
        }

        return storage
    }
}

@EntityRepository(MediaModel)
export class MediaFileRepository extends Repository<MediaModel>
{
    public async findByCampaign({ campaignId }: { campaignId: number }): Promise<{ id: number, contentMD5: string, extension: string, path: string, caption?: string, attribution?: string }[]> {
        return this.createQueryBuilder('media')
            .innerJoinAndSelect('media_storage', 'storage', 'storage.id=media.storage_id')
            .where('media.library_id=:library_id', { library_id: campaignId })
            .select([
                'path',
                'caption',
                'attribution'
            ])
            .addSelect('media.id', 'id')
            .addSelect('storage.content_md5', 'contentMD5')
            .addSelect('storage.extension', 'extension')
            .getRawMany()
    }

    public async findByPath({ campaignId, path }: { campaignId: number, path: string }): Promise<{ id: number, contentMD5: string, extension: string, path: string, caption?: string, attribution?: string } | undefined> {
        return this.createQueryBuilder('media')
            .innerJoinAndSelect('media_storage', 'storage', 'storage.id=media.storage_id')
            .where('media.library_id=:library_id AND media.path=:path', { library_id: campaignId, path })
            .select([
                'path',
                'caption',
                'attribution'
            ])
            .addSelect('media.id', 'id')
            .addSelect('storage.content_md5', 'contentMD5')
            .addSelect('storage.extension', 'extension')
            .getRawOne()
    }
}