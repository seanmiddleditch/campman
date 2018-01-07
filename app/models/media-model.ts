import {Entity, Column, PrimaryColumn, Repository, EntityRepository, ManyToMany, ManyToOne, JoinColumn} from 'typeorm'
import {Label} from './label-model'
import {Library} from './library-model'

@Entity()
export class MediaFile
{
    @PrimaryColumn()
    public path: string

    @Column()
    public s3key: string

    @PrimaryColumn()
    public libraryId: number

    @ManyToOne(t => Library)
    public library: Library

    @Column()
    public caption: string

    @Column()
    public attribution: string

    @ManyToMany(t => Label)
    @JoinColumn()
    public labels: Label[]
}

@EntityRepository(MediaFile)
export class MediaFileRepository extends Repository<MediaFile>
{
    public async findAllByLibrary({libraryID}: {libraryID: number})
    {
        return this.find({
            select: [
                's3key',
                'path',
                'caption',
                'attribution'
            ],
            where: {
                libraryId: libraryID
            }
        })
    }
}